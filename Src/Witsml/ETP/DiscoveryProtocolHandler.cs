using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Avro.IO;
using Avro.Specific;

using Energistics.Datatypes.Object;
using Energistics.Protocol.Discovery;

namespace Witsml.ETP;

internal sealed class DiscoveryProtocolHandler
{
    internal const int ProtocolId = 3;
    internal const int GetResourcesMessageType = 1;
    internal const int GetResourcesResponseMessageType = 2;

    private readonly IProtocolHandlerContext _clientContext;
    private readonly ConcurrentDictionary<long, PendingGetResourcesRequest> _pendingGetResourcesByRequestId = new();

    public DiscoveryProtocolHandler(IProtocolHandlerContext clientContext)
    {
        _clientContext = clientContext ?? throw new ArgumentNullException(nameof(clientContext));
    }

    public async Task<IList<Resource>> GetResourcesAsync(string uri, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(uri))
        {
            throw new ArgumentException("Resource URI is required.", nameof(uri));
        }

        var requestMessageId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingGetResourcesRequest();
        if (!_pendingGetResourcesByRequestId.TryAdd(requestMessageId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending GetResources request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var request = new GetResources { uri = uri };

            await _clientContext.SendEtpMessageAsync(ProtocolId, GetResourcesMessageType, request, cancellationToken, messageId: requestMessageId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30));
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for GetResourcesResponse."));
            }

            return await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingGetResourcesByRequestId.TryRemove(requestMessageId, out _);
        }
    }

    public void TryHandle(int messageType, long correlationId, int messageFlags, BinaryDecoder decoder)
    {
        if (!_pendingGetResourcesByRequestId.TryGetValue(correlationId, out var pendingRequest))
        {
            return;
        }

        if (EtpMessageHelpers.TryReadProtocolException(messageType, decoder, "Discovery.GetResources", out var protocolException))
        {
            pendingRequest.Completion.TrySetException(protocolException);
            return;
        }

        if (messageType == EtpMessageHelpers.AcknowledgeMessageType && EtpMessageHelpers.HasMessageFlag(messageFlags, EtpMessageHelpers.NoDataMessageFlag))
        {
            pendingRequest.Completion.TrySetResult(new List<Resource>());
            return;
        }

        if (messageType != GetResourcesResponseMessageType)
        {
            return;
        }

        var responseReader = new SpecificReader<GetResourcesResponse>(GetResourcesResponse._SCHEMA, GetResourcesResponse._SCHEMA);
        var response = responseReader.Read(new GetResourcesResponse(), decoder);
        if (response?.resource != null)
        {
            lock (pendingRequest)
            {
                pendingRequest.Resources.Add(response.resource);
            }
        }

        var isMultiPart = EtpMessageHelpers.HasMessageFlag(messageFlags, EtpMessageHelpers.MultiPartMessageFlag);
        var isFinalMessagePart = !isMultiPart || EtpMessageHelpers.HasMessageFlag(messageFlags, EtpMessageHelpers.FinalPartMessageFlag);
        if (!isFinalMessagePart)
        {
            return;
        }

        List<Resource> result;
        lock (pendingRequest)
        {
            result = new List<Resource>(pendingRequest.Resources);
        }

        pendingRequest.Completion.TrySetResult(result);

        return;
    }

    private sealed class PendingGetResourcesRequest
    {
        public TaskCompletionSource<IList<Resource>> Completion { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public List<Resource> Resources { get; } = new();
    }
}
