using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Avro.IO;
using Avro.Specific;

using Energistics.Datatypes.Object;
using Energistics.Protocol.Store;

using Witsml.Data;
using Witsml.Xml;

namespace Witsml.ETP;

internal sealed class StoreProtocolHandler
{
    internal const int ProtocolId = 4;
    internal const int GetObjectMessageType = 1;
    internal const int PutObjectMessageType = 2;
    internal const int DeleteObjectMessageType = 3;
    internal const int GetObjectResponseMessageType = 4;

    private readonly IProtocolHandlerContext _clientContext;
    private readonly ConcurrentDictionary<long, PendingGetObjectRequest> _pendingGetObjectByRequestId = new();
    private readonly ConcurrentDictionary<long, PendingAcknowledgeRequest> _pendingAcknowledgeByRequestId = new();

    public StoreProtocolHandler(IProtocolHandlerContext clientContext)
    {
        _clientContext = clientContext ?? throw new ArgumentNullException(nameof(clientContext));
    }

    public async Task<DataObject> GetObjectAsync(string uri, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            throw new ArgumentException("Resource URI is required.", nameof(uri));
        }

        var requestMessageId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingGetObjectRequest();
        if (!_pendingGetObjectByRequestId.TryAdd(requestMessageId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending GetObject request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var request = new GetObject { uri = uri };

            await _clientContext.SendEtpMessageAsync(ProtocolId, GetObjectMessageType, request, cancellationToken, messageId: requestMessageId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30));
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for GetObject response."));
            }

            return await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingGetObjectByRequestId.TryRemove(requestMessageId, out _);
        }
    }

    public async Task<T> GetObjectAsWitsmlAsync<T>(string uri, CancellationToken cancellationToken) where T : IWitsmlObjectList, new()
    {
        var dataObject = await GetObjectAsync(uri, cancellationToken);
        if (dataObject?.data == null || dataObject.data.Length == 0)
        {
            throw new InvalidOperationException("Store.GetObject returned an empty payload.");
        }

        var xmlBytes = GetDecodedPayloadBytes(dataObject.data, dataObject.contentEncoding);
        var xml = Encoding.UTF8.GetString(xmlBytes);
        return XmlHelper.Deserialize(xml, new T());
    }

    public Task PutObjectAsWitsmlAsync<T>(string uri, string contentType, T witsmlObject, CancellationToken cancellationToken) where T : IWitsmlObjectList
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            throw new ArgumentException("Resource URI is required.", nameof(uri));
        }

        if (string.IsNullOrWhiteSpace(contentType))
        {
            throw new ArgumentException("Content type is required.", nameof(contentType));
        }

        ArgumentNullException.ThrowIfNull(witsmlObject);

        var xml = XmlHelper.Serialize(witsmlObject);
        var data = Encoding.UTF8.GetBytes(xml);

        var name = witsmlObject.Objects.FirstOrDefault()?.Name;

        var dataObject = new DataObject
        {
            resource = new Resource
            {
                uri = uri,
                contentType = contentType,
                name = name,
                resourceType = "DataObject",
                customData = new Dictionary<string, string>(),
                lastChanged = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            },
            contentEncoding = string.Empty,
            data = data
        };

        return PutObjectAsync(dataObject, cancellationToken);
    }

    public async Task PutObjectAsync(DataObject dataObject, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(dataObject);

        var requestMessageId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingAcknowledgeRequest();
        if (!_pendingAcknowledgeByRequestId.TryAdd(requestMessageId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending PutObject request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var request = new PutObject { dataObject = dataObject };
            await _clientContext.SendEtpMessageAsync(ProtocolId, PutObjectMessageType, request, cancellationToken, messageId: requestMessageId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30));
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for PutObject acknowledge."));
            }

            await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingAcknowledgeByRequestId.TryRemove(requestMessageId, out _);
        }
    }

    public async Task DeleteObjectAsync(string uri, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            throw new ArgumentException("Resource URI is required.", nameof(uri));
        }

        var requestMessageId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingAcknowledgeRequest();
        if (!_pendingAcknowledgeByRequestId.TryAdd(requestMessageId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending DeleteObject request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var request = new DeleteObject { uri = uri };
            await _clientContext.SendEtpMessageAsync(ProtocolId, DeleteObjectMessageType, request, cancellationToken, messageId: requestMessageId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30));
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for DeleteObject acknowledge."));
            }

            await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingAcknowledgeByRequestId.TryRemove(requestMessageId, out _);
        }
    }

    private static byte[] GetDecodedPayloadBytes(byte[] payload, string contentEncoding)
    {
        if (string.IsNullOrWhiteSpace(contentEncoding))
        {
            return payload;
        }

        if (!string.Equals(contentEncoding, "gzip", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Unsupported contentEncoding '{contentEncoding}' for Store.GetObject payload.");
        }

        using var compressedStream = new MemoryStream(payload);
        using var gzipStream = new GZipStream(compressedStream, CompressionMode.Decompress);
        using var outputStream = new MemoryStream();
        gzipStream.CopyTo(outputStream);
        return outputStream.ToArray();
    }

    public void TryHandle(int messageType, long correlationId, int messageFlags, BinaryDecoder decoder)
    {
        if (_pendingGetObjectByRequestId.TryGetValue(correlationId, out var getObjectRequest))
        {
            HandleGetObjectResponse(messageType, messageFlags, decoder, getObjectRequest);
            return;
        }

        if (_pendingAcknowledgeByRequestId.TryGetValue(correlationId, out var ackRequest))
        {
            HandleAcknowledgeResponse(messageType, decoder, ackRequest);
        }
    }

    private static void HandleGetObjectResponse(int messageType, int messageFlags, BinaryDecoder decoder, PendingGetObjectRequest pendingRequest)
    {
        if (EtpMessageHelpers.TryReadProtocolException(messageType, decoder, "Store.GetObject", out var protocolException))
        {
            pendingRequest.Completion.TrySetException(protocolException);
            return;
        }

        if (messageType == EtpMessageHelpers.AcknowledgeMessageType && EtpMessageHelpers.HasMessageFlag(messageFlags, EtpMessageHelpers.NoDataMessageFlag))
        {
            pendingRequest.Completion.TrySetException(new InvalidOperationException("No data was returned for Store.GetObject."));
            return;
        }

        if (messageType != GetObjectResponseMessageType)
        {
            return;
        }

        var responseReader = new SpecificReader<Energistics.Protocol.Store.Object>(Energistics.Protocol.Store.Object._SCHEMA, Energistics.Protocol.Store.Object._SCHEMA);
        var response = responseReader.Read(new Energistics.Protocol.Store.Object(), decoder);
        if (response?.dataObject != null)
        {
            lock (pendingRequest)
            {
                pendingRequest.Object = MergeDataObjectParts(pendingRequest.Object, response.dataObject);
            }
        }

        var isMultiPart = EtpMessageHelpers.HasMessageFlag(messageFlags, EtpMessageHelpers.MultiPartMessageFlag);
        var isFinalMessagePart = !isMultiPart || EtpMessageHelpers.HasMessageFlag(messageFlags, EtpMessageHelpers.FinalPartMessageFlag);
        if (!isFinalMessagePart)
        {
            return;
        }

        DataObject result;
        lock (pendingRequest)
        {
            result = pendingRequest.Object;
        }

        if (result == null)
        {
            pendingRequest.Completion.TrySetException(new InvalidOperationException("Store.GetObject completed without a data object payload."));
            return;
        }

        pendingRequest.Completion.TrySetResult(result);
    }

    private static void HandleAcknowledgeResponse(int messageType, BinaryDecoder decoder, PendingAcknowledgeRequest pendingRequest)
    {
        if (EtpMessageHelpers.TryReadProtocolException(messageType, decoder, "Store", out var protocolException))
        {
            pendingRequest.Completion.TrySetException(protocolException);
            return;
        }

        if (messageType == EtpMessageHelpers.AcknowledgeMessageType)
        {
            pendingRequest.Completion.TrySetResult();
        }
    }

    private static DataObject MergeDataObjectParts(DataObject current, DataObject incoming)
    {
        if (current == null)
        {
            return incoming;
        }

        if (incoming == null)
        {
            return current;
        }

        if (incoming.resource != null)
        {
            current.resource = incoming.resource;
        }

        if (!string.IsNullOrWhiteSpace(incoming.contentEncoding))
        {
            current.contentEncoding = incoming.contentEncoding;
        }

        if (incoming.data == null || incoming.data.Length == 0)
        {
            return current;
        }

        if (current.data == null || current.data.Length == 0)
        {
            current.data = incoming.data;
            return current;
        }

        var combined = new byte[current.data.Length + incoming.data.Length];
        Buffer.BlockCopy(current.data, 0, combined, 0, current.data.Length);
        Buffer.BlockCopy(incoming.data, 0, combined, current.data.Length, incoming.data.Length);
        current.data = combined;

        return current;
    }

    private sealed class PendingGetObjectRequest
    {
        public TaskCompletionSource<DataObject> Completion { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public DataObject Object { get; set; }
    }

    private sealed class PendingAcknowledgeRequest
    {
        public TaskCompletionSource Completion { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    }
}
