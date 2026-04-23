using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Avro.IO;
using Avro.Specific;

using Energistics.Datatypes;
using Energistics.Protocol.Core;

namespace Witsml.ETP;

internal sealed class CoreProtocolHandler
{
    internal const int ProtocolId = 0;
    internal const int RequestSessionMessageType = 1;
    internal const int OpenSessionMessageType = 2;
    internal const int CloseSessionMessageType = 5;

    private readonly SemaphoreSlim _sessionStateGate = new(1, 1);
    private readonly ICoreProtocolHandlerContext _clientContext;
    private readonly EtpSessionOptions _sessionOptions;
    private TaskCompletionSource<OpenSessionInfo> _openSessionTcs;

    public bool IsSessionOpen => _clientContext.IsTransportOpen && SessionId.HasValue;
    public bool IsSessionClosed => _sessionClosed;
    public Guid? SessionId { get; private set; }
    public EtpServerCapabilities ServerCapabilities { get; private set; }

    private volatile bool _sessionClosed;

    public CoreProtocolHandler(ICoreProtocolHandlerContext clientContext, EtpSessionOptions sessionOptions)
    {
        _clientContext = clientContext ?? throw new ArgumentNullException(nameof(clientContext));
        _sessionOptions = sessionOptions ?? throw new ArgumentNullException(nameof(sessionOptions));
    }

    public async Task RequestSessionAsync(CancellationToken cancellationToken = default)
    {
        await _sessionStateGate.WaitAsync(cancellationToken);
        try
        {
            if (_sessionClosed)
            {
                throw new InvalidOperationException("The ETP session has been permanently closed. Create a new EtpClient instance.");
            }

            _openSessionTcs = new TaskCompletionSource<OpenSessionInfo>(TaskCreationOptions.RunContinuationsAsynchronously);
            SessionId = null;
            ServerCapabilities = null;
        }
        finally
        {
            _sessionStateGate.Release();
        }

        try
        {
            await _clientContext.OpenTransportAsync(_sessionOptions, cancellationToken);

            var request = BuildRequestSession(_sessionOptions);

            await _clientContext.SendEtpMessageAsync(ProtocolId, RequestSessionMessageType, request, cancellationToken);

            var openSessionInfo = await WaitForOpenSessionAsync(cancellationToken);

            await _sessionStateGate.WaitAsync(cancellationToken);
            try
            {
                SessionId = openSessionInfo.SessionId;
                ServerCapabilities = openSessionInfo.Capabilities;
            }
            finally
            {
                _sessionStateGate.Release();
            }
        }
        catch
        {
            await _clientContext.CloseTransportAsync("Failed to open ETP session", cancellationToken);
            throw;
        }
    }

    public async Task CloseSessionAsync(string reason, CancellationToken cancellationToken = default)
    {
        if (_sessionClosed)
        {
            return;
        }

        _sessionClosed = true;

        if (_clientContext.IsTransportOpen)
        {
            try
            {
                var close = new CloseSession { reason = reason };
                await _clientContext.SendEtpMessageAsync(ProtocolId, CloseSessionMessageType, close, cancellationToken);
            }
            catch (Exception)
            {
            }
        }

        await _clientContext.CloseTransportAsync(reason, cancellationToken);

        await _sessionStateGate.WaitAsync(cancellationToken);
        try
        {
            SessionId = null;
            ServerCapabilities = null;
            _openSessionTcs = null;
        }
        finally
        {
            _sessionStateGate.Release();
        }
    }

    public async Task TryHandleAsync(int protocolId, int messageType, BinaryDecoder decoder, CancellationToken cancellationToken)
    {
        if (protocolId != ProtocolId)
        {
            return;
        }

        if (messageType == OpenSessionMessageType)
        {
            await HandleOpenSessionAsync(decoder, cancellationToken);
            return;
        }

        if (messageType == CloseSessionMessageType)
        {
            await HandleCloseSessionAsync(decoder, cancellationToken);
        }
    }

    private async Task HandleOpenSessionAsync(BinaryDecoder decoder, CancellationToken cancellationToken)
    {
        var openSessionReader = new SpecificReader<OpenSession>(OpenSession._SCHEMA, OpenSession._SCHEMA);
        var openSession = openSessionReader.Read(new OpenSession(), decoder);
        var sessionId = Guid.TryParse(openSession.sessionId, out var parsed) ? parsed : (Guid?)null;
        var capabilities = openSession.ToServerCapabilities(sessionId);

        await _sessionStateGate.WaitAsync(cancellationToken);
        try
        {
            _openSessionTcs?.TrySetResult(new OpenSessionInfo(sessionId, capabilities));
        }
        finally
        {
            _sessionStateGate.Release();
        }
    }

    private async Task HandleCloseSessionAsync(BinaryDecoder decoder, CancellationToken cancellationToken)
    {
        var closeSessionReader = new SpecificReader<CloseSession>(CloseSession._SCHEMA, CloseSession._SCHEMA);
        var closeSession = closeSessionReader.Read(new CloseSession(), decoder);
        var reason = string.IsNullOrWhiteSpace(closeSession.reason)
            ? "The server closed the ETP session."
            : closeSession.reason;

        await _sessionStateGate.WaitAsync(cancellationToken);
        try
        {
            SessionId = null;
            ServerCapabilities = null;
            _openSessionTcs?.TrySetException(new InvalidOperationException($"ETP session was closed by server: {reason}"));
            _openSessionTcs = null;
            _sessionClosed = true;
        }
        finally
        {
            _sessionStateGate.Release();
        }
    }

    private async Task<OpenSessionInfo> WaitForOpenSessionAsync(CancellationToken cancellationToken)
    {
        Task<OpenSessionInfo> pendingOpenSession;
        await _sessionStateGate.WaitAsync(cancellationToken);
        try
        {
            pendingOpenSession = (_openSessionTcs ?? throw new InvalidOperationException("OpenSession wait state was not initialized.")).Task;
        }
        finally
        {
            _sessionStateGate.Release();
        }

        var timeout = TimeSpan.FromSeconds(30);
        var completedTask = await Task.WhenAny(pendingOpenSession, Task.Delay(timeout, cancellationToken));

        if (completedTask != pendingOpenSession)
        {
            throw new TimeoutException($"Timed out waiting for OpenSession after {timeout.TotalSeconds:N0} seconds.");
        }

        return await pendingOpenSession;
    }

    private sealed record OpenSessionInfo(Guid? SessionId, EtpServerCapabilities Capabilities);

    private static RequestSession BuildRequestSession(EtpSessionOptions options)
    {
        return new RequestSession
        {
            applicationName = options.AppName,
            applicationVersion = options.AppVersion,
            requestedProtocols = options.RequestedProtocols.Select(ToSupportedProtocol).ToList(),
            supportedObjects = new List<string>
            {
                "application/x-witsml+xml;version=1.4.1.1;type=*"
            }
        };
    }

    private static SupportedProtocol ToSupportedProtocol(RequestedProtocol requestedProtocol)
    {
        return new SupportedProtocol
        {
            protocol = requestedProtocol.ProtocolId,
            role = requestedProtocol.Role,
            protocolVersion = new Energistics.Datatypes.Version
            {
                major = 1,
                minor = 1,
                revision = 0,
                patch = 0
            },
            protocolCapabilities = new Dictionary<string, DataValue>()
        };
    }
}
