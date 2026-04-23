using System;
using System.Buffers;
using System.IO;
using System.Net.Http.Headers;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Witsml.ETP;

/// <summary>
/// Abstract base class that manages a secure WebSocket connection for ETP v1.1.
/// Handles connect, receive loop, send, and graceful close. Subclasses implement
/// ETP message handling via <see cref="OnMessageReceivedAsync"/>.
/// </summary>
public abstract class EtpWebSocketTransport : IAsyncDisposable
{
    protected const string WebSocketSubProtocol = "energistics-tp";
    private const int ReceiveBufferSize = 16 * 1024;
    private readonly SemaphoreSlim _stateGate = new(1, 1);
    private readonly Func<ClientWebSocket> _webSocketFactory;
    private ClientWebSocket _webSocket;
    private CancellationTokenSource _receiveLoopCts;
    private Task _receiveLoopTask;
    private bool _hasTransportOpened;
    private bool _disposed;

    protected EtpWebSocketTransport(Func<ClientWebSocket> webSocketFactory = null)
    {
        _webSocketFactory = webSocketFactory ?? (() => new ClientWebSocket());
    }

    protected bool IsTransportOpen { get; private set; }

    protected async Task OpenTransportAsync(EtpSessionOptions options, CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (options.Endpoint is null)
        {
            throw new ArgumentNullException(nameof(options.Endpoint));
        }

        if (!string.Equals(options.Endpoint.Scheme, Uri.UriSchemeWss, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Only secure WebSocket endpoints (wss://) are supported.");
        }

        await _stateGate.WaitAsync(cancellationToken);
        try
        {
            if (IsTransportOpen)
            {
                throw new InvalidOperationException("The ETP transport is already open.");
            }
            if (_hasTransportOpened)
            {
                throw new InvalidOperationException("The ETP transport cannot be reopened. Create a new client instance.");
            }
        }
        finally
        {
            _stateGate.Release();
        }

        var webSocket = ConfigureWebSocket(_webSocketFactory, options);
        var receiveLoopCts = new CancellationTokenSource();
        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(30));

            await webSocket.ConnectAsync(options.Endpoint, timeoutCts.Token);

            if (!string.Equals(webSocket.SubProtocol, WebSocketSubProtocol, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"The server did not negotiate the required WebSocket subprotocol '{WebSocketSubProtocol}'.");
            }

            await _stateGate.WaitAsync(cancellationToken);
            try
            {
                ThrowIfDisposed();

                _webSocket = webSocket;
                _receiveLoopCts = receiveLoopCts;
                _receiveLoopTask = RunReceiveLoopAsync(webSocket, receiveLoopCts.Token);
                _hasTransportOpened = true;
                IsTransportOpen = true;
            }
            finally
            {
                _stateGate.Release();
            }
        }
        catch
        {
            receiveLoopCts.Dispose();
            webSocket.Dispose();
            throw;
        }
    }

    protected async Task CloseTransportAsync(string reason, CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        ClientWebSocket webSocket;
        CancellationTokenSource receiveLoopCts;
        Task receiveLoopTask;

        await _stateGate.WaitAsync(cancellationToken);
        try
        {
            webSocket = _webSocket;
            receiveLoopCts = _receiveLoopCts;
            receiveLoopTask = _receiveLoopTask;

            _webSocket = null;
            _receiveLoopCts = null;
            _receiveLoopTask = null;
            IsTransportOpen = false;
        }
        finally
        {
            _stateGate.Release();
        }

        receiveLoopCts?.Cancel();

        if (webSocket != null)
        {
            try
            {
                if (webSocket.State is WebSocketState.Open or WebSocketState.CloseReceived)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, reason, cancellationToken);
                }
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (WebSocketException)
            {
            }
            finally
            {
                webSocket.Dispose();
            }
        }

        if (receiveLoopTask != null)
        {
            try
            {
                await receiveLoopTask;
            }
            catch (OperationCanceledException)
            {
            }
            catch (WebSocketException)
            {
            }
        }

        receiveLoopCts?.Dispose();
    }

    protected async Task SendMessageAsync(ReadOnlyMemory<byte> payload, WebSocketMessageType messageType = WebSocketMessageType.Binary, CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        ClientWebSocket webSocket;
        await _stateGate.WaitAsync(cancellationToken);
        try
        {
            webSocket = _webSocket;
        }
        finally
        {
            _stateGate.Release();
        }

        if (webSocket?.State != WebSocketState.Open)
        {
            throw new InvalidOperationException("The ETP WebSocket transport is not open.");
        }

        await webSocket.SendAsync(payload, messageType, true, cancellationToken);
    }

    protected virtual Task OnMessageReceivedAsync(ReadOnlyMemory<byte> payload, WebSocketMessageType messageType, CancellationToken cancellationToken) => Task.CompletedTask;

    private static ClientWebSocket ConfigureWebSocket(Func<ClientWebSocket> webSocketFactory, EtpSessionOptions sessionOptions)
    {
        var webSocket = webSocketFactory();
        var options = webSocket.Options;
        options.AddSubProtocol(WebSocketSubProtocol);
        options.SetRequestHeader("etpencoding", "binary");

        if (sessionOptions.HttpHeaders != null)
        {
            foreach (var header in sessionOptions.HttpHeaders)
            {
                options.SetRequestHeader(header.Key, header.Value);
            }
        }

        if (sessionOptions.BasicAuth != null)
        {
            var authorizationHeader = CreateBasicAuthenticationHeader(sessionOptions.BasicAuth);
            options.SetRequestHeader("Authorization", authorizationHeader.ToString());
        }

        return webSocket;
    }

    private static AuthenticationHeaderValue CreateBasicAuthenticationHeader(EtpBasicAuthCredentials credentials)
    {
        var rawValue = $"{credentials.Username}:{credentials.Password}";
        var encodedValue = Convert.ToBase64String(Encoding.ASCII.GetBytes(rawValue));
        return new AuthenticationHeaderValue("Basic", encodedValue);
    }

    private async Task RunReceiveLoopAsync(ClientWebSocket webSocket, CancellationToken cancellationToken)
    {
        var buffer = ArrayPool<byte>.Shared.Rent(ReceiveBufferSize);

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                using var messageStream = new MemoryStream();

                WebSocketReceiveResult result;
                do
                {
                    result = await webSocket.ReceiveAsync(buffer, cancellationToken);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await TransitionToClosedStateAsync(webSocket);
                        return;
                    }

                    messageStream.Write(buffer, 0, result.Count);
                } while (!result.EndOfMessage);

                await OnMessageReceivedAsync(messageStream.ToArray(), result.MessageType, cancellationToken);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Expected during normal shutdown. CloseTransportAsync already clears transport state
            // before canceling this token, so no additional transition is required here.
        }
        catch (WebSocketException)
        {
            await TransitionToClosedStateAsync(webSocket);
            throw;
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer, clearArray: true);
        }
    }

    private async Task TransitionToClosedStateAsync(ClientWebSocket webSocket)
    {
        CancellationTokenSource receiveLoopCts;
        await _stateGate.WaitAsync();
        try
        {
            receiveLoopCts = _receiveLoopCts;
            _webSocket = null;
            _receiveLoopCts = null;
            _receiveLoopTask = null;
            IsTransportOpen = false;
        }
        finally
        {
            _stateGate.Release();
        }

        receiveLoopCts?.Dispose();
        webSocket.Dispose();
    }

    protected void ThrowIfDisposed()
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(GetType().Name);
        }
    }

    protected virtual Task OnDisposingAsync() => Task.CompletedTask;

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
        {
            return;
        }

        try
        {
            await OnDisposingAsync();
            await CloseTransportAsync("Disposing ETP transport");
        }
        catch (ObjectDisposedException)
        {
        }
        finally
        {
            _disposed = true;
            _stateGate.Dispose();
        }
    }
}
