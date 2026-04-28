using System;
using System.IO;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

using Avro.IO;
using Avro.Specific;

using Energistics.Datatypes;

namespace Witsml.ETP;

/// <summary>
/// ETP v1.1 client. Establishes a session with a server, serializes and deserializes
/// ETP messages using Avro binary encoding, and dispatches them to protocol handlers.
/// Use <see cref="ConnectAsync"/> to create a connected instance. Keep the instance alive
/// for the duration of work. Session setup is not intended to be repeated per request. 
/// Each instance can only be connected once; create a new instance to reconnect.
/// </summary>
public class EtpClient : EtpWebSocketTransport, IEtpClient, ICoreProtocolHandlerContext
{
    private readonly CoreProtocolHandler _coreProtocolHandler;
    private EtpServerCapabilities _serverCapabilities;
    private long _messageId;

    private EtpClient(EtpSessionOptions sessionOptions, Func<ClientWebSocket> webSocketFactory) : base(webSocketFactory)
    {
        var options = sessionOptions ?? throw new ArgumentNullException(nameof(sessionOptions));
        _coreProtocolHandler = new CoreProtocolHandler(this, options);
    }

    public static async Task<EtpClient> ConnectAsync(EtpSessionOptions sessionOptions, Func<ClientWebSocket> webSocketFactory = null, CancellationToken cancellationToken = default)
    {
        var client = new EtpClient(sessionOptions, webSocketFactory);
        await client._coreProtocolHandler.RequestSessionAsync(cancellationToken);
        client._serverCapabilities = client._coreProtocolHandler.ServerCapabilities;
        return client;
    }

    public bool IsSessionOpen => _coreProtocolHandler.IsSessionOpen;

    public Guid? SessionId => _coreProtocolHandler.SessionId;

    public Task CloseSessionAsync(string reason = "Closure requested by client", CancellationToken cancellationToken = default) =>
        _coreProtocolHandler.CloseSessionAsync(reason, cancellationToken);

    public EtpServerCapabilities GetServerCapabilities()
    {
        ThrowIfDisposed();
        return _serverCapabilities;
    }

    protected override async Task OnDisposingAsync()
    {
        try
        {
            await _coreProtocolHandler.CloseSessionAsync("Disposing ETP client");
        }
        catch (Exception)
        {
        }
    }

    protected override async Task OnMessageReceivedAsync(ReadOnlyMemory<byte> payload, WebSocketMessageType messageType, CancellationToken cancellationToken)
    {
        if (messageType != WebSocketMessageType.Binary || payload.Length == 0)
        {
            return;
        }

        using var stream = new MemoryStream(payload.ToArray(), writable: false);
        var decoder = new BinaryDecoder(stream);

        var headerReader = new SpecificReader<MessageHeader>(MessageHeader._SCHEMA, MessageHeader._SCHEMA);
        var header = headerReader.Read(new MessageHeader(), decoder);

        await _coreProtocolHandler.TryHandleAsync(header.protocol, header.messageType, decoder, cancellationToken);
    }

    bool ICoreProtocolHandlerContext.IsTransportOpen => IsTransportOpen;

    Task ICoreProtocolHandlerContext.OpenTransportAsync(EtpSessionOptions options, CancellationToken cancellationToken) =>
        OpenTransportAsync(options, cancellationToken);

    Task ICoreProtocolHandlerContext.CloseTransportAsync(string reason, CancellationToken cancellationToken) =>
        CloseTransportAsync(reason, cancellationToken);

    Task IProtocolHandlerContext.SendEtpMessageAsync<TBody>(int protocol, int messageType, TBody body, CancellationToken cancellationToken) => SendEtpMessageAsync(protocol, messageType, body, cancellationToken);

    private async Task SendEtpMessageAsync<TBody>(int protocol, int messageType, TBody body, CancellationToken cancellationToken) where TBody : ISpecificRecord
    {
        if (_coreProtocolHandler.IsSessionClosed)
        {
            throw new InvalidOperationException("The ETP session has been permanently closed. Create a new EtpClient instance.");
        }

        var nextId = Interlocked.Increment(ref _messageId);
        var header = new MessageHeader
        {
            protocol = protocol,
            messageType = messageType,
            messageId = nextId,
            correlationId = 0,
            messageFlags = 0
        };

        using var stream = new MemoryStream();
        var encoder = new BinaryEncoder(stream);

        var headerWriter = new SpecificWriter<MessageHeader>(MessageHeader._SCHEMA);
        headerWriter.Write(header, encoder);

        var bodyWriter = new SpecificWriter<TBody>(body.Schema);
        bodyWriter.Write(body, encoder);

        await SendMessageAsync(stream.ToArray(), WebSocketMessageType.Binary, cancellationToken);
    }
}
