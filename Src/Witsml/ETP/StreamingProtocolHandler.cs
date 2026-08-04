using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Avro.IO;
using Avro.Specific;

using Energistics.Datatypes;
using Energistics.Datatypes.ChannelData;
using Energistics.Protocol.ChannelStreaming;

namespace Witsml.ETP;

internal sealed class StreamingProtocolHandler
{
    internal const int ProtocolId = 1; // ChannelStreaming
    internal const int StartMessageType = 0;
    internal const int ChannelDescribeMessageType = 1;
    internal const int ChannelMetadataMessageType = 2;
    internal const int ChannelDataMessageType = 3;
    internal const int ChannelStreamingStartMessageType = 4;
    internal const int ChannelStreamingStopMessageType = 5;
    internal const int ChannelRangeRequestMessageType = 9;

    private readonly IProtocolHandlerContext _clientContext;
    private readonly ConcurrentDictionary<long, PendingGetChannelDataRequest> _pendingByDescribeRequestId = new();
    private readonly ConcurrentDictionary<long, PendingGetChannelMetadataRequest> _pendingMetadataByDescribeRequestId = new();
    private readonly ConcurrentDictionary<long, PendingGetChannelRangeDataRequest> _pendingRangeByRequestId = new();

    public StreamingProtocolHandler(IProtocolHandlerContext clientContext)
    {
        _clientContext = clientContext ?? throw new ArgumentNullException(nameof(clientContext));
    }

    public async Task<IReadOnlyDictionary<long, IReadOnlyList<DataItem>>> GetChannelDataAsync(IList<string> channelUris, TimeSpan bufferDuration, CancellationToken cancellationToken)
    {
        if (channelUris == null || channelUris.Count == 0)
        {
            throw new ArgumentException("At least one channel URI is required.", nameof(channelUris));
        }

        if (bufferDuration <= TimeSpan.Zero)
        {
            throw new ArgumentException("Buffer duration must be greater than zero.", nameof(bufferDuration));
        }

        var describeRequestId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingGetChannelDataRequest(bufferDuration);

        if (!_pendingByDescribeRequestId.TryAdd(describeRequestId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending channel data request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var start = new Start
            {
                maxMessageRate = 100,
                maxDataItems = 1000
            };

            await _clientContext.SendEtpMessageAsync(ProtocolId, StartMessageType, start, cancellationToken);

            var describe = new ChannelDescribe { uris = channelUris };
            await _clientContext.SendEtpMessageAsync(ProtocolId, ChannelDescribeMessageType, describe, cancellationToken, messageId: describeRequestId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30) + bufferDuration);
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for channel streaming data."));
            }

            return await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingByDescribeRequestId.TryRemove(describeRequestId, out _);
        }
    }

    public async Task TryHandleAsync(MessageHeader header, BinaryDecoder decoder, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(header);

        var messageType = header.messageType;
        var correlationId = header.correlationId;

        if (messageType == ChannelMetadataMessageType)
        {
            await HandleChannelMetadataAsync(header, decoder, correlationId, cancellationToken);
            return;
        }

        if (messageType == ChannelDataMessageType)
        {
            HandleChannelData(header, decoder, correlationId);
            return;
        }

        if (messageType == EtpMessageHelpers.ProtocolExceptionMessageType)
        {
            if (EtpMessageHelpers.TryReadProtocolException(messageType, decoder, "ChannelStreaming", out var protocolException, out var protocolExceptionBody))
            {
                _clientContext.LogReceivedMessage(header, protocolExceptionBody);

                if (_pendingByDescribeRequestId.TryGetValue(correlationId, out var pendingRequest))
                {
                    pendingRequest.Completion.TrySetException(protocolException);
                }

                if (_pendingMetadataByDescribeRequestId.TryGetValue(correlationId, out var pendingMetadataRequest))
                {
                    pendingMetadataRequest.Completion.TrySetException(protocolException);
                }

                if (_pendingRangeByRequestId.TryGetValue(correlationId, out var pendingRangeRequest))
                {
                    pendingRangeRequest.Completion.TrySetException(protocolException);
                }
            }
        }
    }

    private async Task HandleChannelMetadataAsync(MessageHeader header, BinaryDecoder decoder, long correlationId, CancellationToken cancellationToken)
    {
        var responseReader = new SpecificReader<ChannelMetadata>(ChannelMetadata._SCHEMA, ChannelMetadata._SCHEMA);
        var response = responseReader.Read(new ChannelMetadata(), decoder);
        _clientContext.LogReceivedMessage(header, response);

        if (_pendingMetadataByDescribeRequestId.TryGetValue(correlationId, out var pendingMetadataRequest))
        {
            if (response?.channels != null)
            {
                lock (pendingMetadataRequest.SyncRoot)
                {
                    foreach (var channel in response.channels)
                    {
                        pendingMetadataRequest.MetadataByChannelId[channel.channelId] = response;
                    }
                }
            }

            var isMultiPartMetadata = EtpMessageHelpers.HasMessageFlag(header.messageFlags, EtpMessageHelpers.MultiPartMessageFlag);
            var isFinalMetadataPart = !isMultiPartMetadata || EtpMessageHelpers.HasMessageFlag(header.messageFlags, EtpMessageHelpers.FinalPartMessageFlag);
            if (isFinalMetadataPart)
            {
                Dictionary<long, ChannelMetadata> result;
                lock (pendingMetadataRequest.SyncRoot)
                {
                    result = new Dictionary<long, ChannelMetadata>(pendingMetadataRequest.MetadataByChannelId);
                }

                pendingMetadataRequest.Completion.TrySetResult(result);
            }
        }

        if (!_pendingByDescribeRequestId.TryGetValue(correlationId, out var pendingRequest))
        {
            return;
        }

        if (response?.channels != null)
        {
            lock (pendingRequest.SyncRoot)
            {
                pendingRequest.ChannelIds.AddRange(response.channels.Select(c => c.channelId));
            }
        }

        var isMultiPart = EtpMessageHelpers.HasMessageFlag(header.messageFlags, EtpMessageHelpers.MultiPartMessageFlag);
        var isFinalMessagePart = !isMultiPart || EtpMessageHelpers.HasMessageFlag(header.messageFlags, EtpMessageHelpers.FinalPartMessageFlag);
        if (!isFinalMessagePart)
        {
            return;
        }

        List<long> channelIds;
        lock (pendingRequest.SyncRoot)
        {
            if (pendingRequest.IsStreamingStarted)
            {
                return;
            }

            pendingRequest.IsStreamingStarted = true;
            channelIds = pendingRequest.ChannelIds.Distinct().ToList();
        }

        if (channelIds.Count == 0)
        {
            pendingRequest.Completion.TrySetResult(new Dictionary<long, IReadOnlyList<DataItem>>());
            return;
        }

        var startStreaming = new ChannelStreamingStart
        {
            channels = channelIds
                .Select(channelId => new ChannelStreamingInfo
                {
                    channelId = channelId,
                    receiveChangeNotification = false,
                    startIndex = new StreamingStartIndex { item = null }
                })
                .ToList()
        };

        await _clientContext.SendEtpMessageAsync(ProtocolId, ChannelStreamingStartMessageType, startStreaming, cancellationToken);

        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(pendingRequest.BufferDuration);
                var stopStreaming = new ChannelStreamingStop { channels = channelIds };
                await _clientContext.SendEtpMessageAsync(ProtocolId, ChannelStreamingStopMessageType, stopStreaming, CancellationToken.None);

                Dictionary<long, IReadOnlyList<DataItem>> result;
                lock (pendingRequest.SyncRoot)
                {
                    result = pendingRequest.Buffer.ToDictionary(
                        kvp => kvp.Key,
                        kvp => (IReadOnlyList<DataItem>)kvp.Value.ToList());
                }

                pendingRequest.Completion.TrySetResult(result);
            }
            catch (Exception ex)
            {
                pendingRequest.Completion.TrySetException(ex);
            }
        });
    }

    private void HandleChannelData(MessageHeader header, BinaryDecoder decoder, long correlationId)
    {
        var responseReader = new SpecificReader<ChannelData>(ChannelData._SCHEMA, ChannelData._SCHEMA);
        var response = responseReader.Read(new ChannelData(), decoder);
        _clientContext.LogReceivedMessage(header, response);

        if (_pendingRangeByRequestId.TryGetValue(correlationId, out var pendingRangeRequest))
        {
            lock (pendingRangeRequest.SyncRoot)
            {
                if (!pendingRangeRequest.Completion.Task.IsCompleted && response?.data != null && response.data.Count > 0)
                {
                    var filteredItems = new List<DataItem>(response.data.Count);
                    foreach (var item in response.data)
                    {
                        pendingRangeRequest.ItemCountByChannelId.TryGetValue(item.channelId, out var currentCount);
                        if (currentCount >= pendingRangeRequest.MaxRows)
                        {
                            continue;
                        }

                        filteredItems.Add(item);
                        pendingRangeRequest.ItemCountByChannelId[item.channelId] = currentCount + 1;
                    }

                    if (filteredItems.Count > 0)
                    {
                        response.data = filteredItems;
                        pendingRangeRequest.Responses.Add(response);
                    }
                }
            }

            var isMultiPart = EtpMessageHelpers.HasMessageFlag(header.messageFlags, EtpMessageHelpers.MultiPartMessageFlag);
            var isFinalMessagePart = !isMultiPart || EtpMessageHelpers.HasMessageFlag(header.messageFlags, EtpMessageHelpers.FinalPartMessageFlag);
            if (isFinalMessagePart)
            {
                List<ChannelData> result;
                lock (pendingRangeRequest.SyncRoot)
                {
                    result = pendingRangeRequest.Responses.ToList();
                }

                pendingRangeRequest.Completion.TrySetResult(result);
            }

            return;
        }

        if (response?.data == null || response.data.Count == 0)
        {
            return;
        }

        foreach (var pending in _pendingByDescribeRequestId.Values)
        {
            lock (pending.SyncRoot)
            {
                if (!pending.IsStreamingStarted || pending.Completion.Task.IsCompleted)
                {
                    continue;
                }

                foreach (var item in response.data)
                {
                    if (!pending.Buffer.TryGetValue(item.channelId, out var items))
                    {
                        items = new List<DataItem>();
                        pending.Buffer[item.channelId] = items;
                    }

                    items.Add(item);
                }
            }
        }
    }

    public async Task<Dictionary<long, ChannelMetadata>> GetChannelMetadataAsync(List<string> emls, CancellationToken? cancellationToken)
    {
        return await GetChannelMetadataInternalAsync(emls, cancellationToken ?? CancellationToken.None);
    }

    private async Task<Dictionary<long, ChannelMetadata>> GetChannelMetadataInternalAsync(IList<string> emls, CancellationToken cancellationToken)
    {
        if (emls == null || emls.Count == 0)
        {
            throw new ArgumentException("At least one channel URI is required.", nameof(emls));
        }

        var describeRequestId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingGetChannelMetadataRequest();

        if (!_pendingMetadataByDescribeRequestId.TryAdd(describeRequestId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending channel metadata request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var start = new Start
            {
                maxMessageRate = 100,
                maxDataItems = 1000
            };

            await _clientContext.SendEtpMessageAsync(ProtocolId, StartMessageType, start, cancellationToken);

            var describe = new ChannelDescribe { uris = emls };
            await _clientContext.SendEtpMessageAsync(ProtocolId, ChannelDescribeMessageType, describe, cancellationToken, messageId: describeRequestId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30));
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for channel metadata."));
            }

            return await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingMetadataByDescribeRequestId.TryRemove(describeRequestId, out _);
        }
    }

    public async Task<List<ChannelData>> GetChannelRangeDataAsync(List<long> channelIds, long startIndex, long endIndex, int maxRows, CancellationToken? token)
    {
        CancellationToken cancellationToken = token ?? CancellationToken.None;
        if (channelIds == null || channelIds.Count == 0)
        {
            throw new ArgumentException("At least one channel id is required.", nameof(channelIds));
        }

        if (maxRows <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(maxRows), "maxRows must be greater than zero.");
        }

        var requestId = _clientContext.ReserveMessageId();
        var pendingRequest = new PendingGetChannelRangeDataRequest(maxRows);

        if (!_pendingRangeByRequestId.TryAdd(requestId, pendingRequest))
        {
            throw new InvalidOperationException("Failed to register pending channel range request.");
        }

        using var cancellationRegistration = cancellationToken.Register(() => pendingRequest.Completion.TrySetCanceled(cancellationToken));

        try
        {
            var rangeRequest = new ChannelRangeRequest
            {
                channelRanges = channelIds.Select(channelId => new ChannelRangeInfo
                    {
                        channelId = new List<long> { channelId },
                        startIndex = startIndex,
                        endIndex = endIndex
                        
                    })
                    .ToList()
            };

            await _clientContext.SendEtpMessageAsync(ProtocolId, ChannelRangeRequestMessageType, rangeRequest, cancellationToken, messageId: requestId);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30));
            var completedTask = await Task.WhenAny(pendingRequest.Completion.Task, timeoutTask);
            if (completedTask == timeoutTask)
            {
                pendingRequest.Completion.TrySetException(new TimeoutException("Timed out waiting for channel range data."));
            }

            return await pendingRequest.Completion.Task;
        }
        finally
        {
            _pendingRangeByRequestId.TryRemove(requestId, out _);
        }
    }


    private sealed class PendingGetChannelMetadataRequest
    {
        public object SyncRoot { get; } = new();
        public Dictionary<long, ChannelMetadata> MetadataByChannelId { get; } = new();
        public TaskCompletionSource<Dictionary<long, ChannelMetadata>> Completion { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    }

    private sealed class PendingGetChannelRangeDataRequest
    {
        public PendingGetChannelRangeDataRequest(int maxRows)
        {
            MaxRows = maxRows;
        }

        public object SyncRoot { get; } = new();
        public int MaxRows { get; }
        public Dictionary<long, int> ItemCountByChannelId { get; } = new();
        public List<ChannelData> Responses { get; } = new();
        public TaskCompletionSource<List<ChannelData>> Completion { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    }

    private sealed class PendingGetChannelDataRequest
    {
        public PendingGetChannelDataRequest(TimeSpan bufferDuration)
        {
            BufferDuration = bufferDuration;
        }

        public object SyncRoot { get; } = new();
        public TimeSpan BufferDuration { get; }
        public bool IsStreamingStarted { get; set; }
        public List<long> ChannelIds { get; } = new();
        public Dictionary<long, List<DataItem>> Buffer { get; } = new();
        public TaskCompletionSource<IReadOnlyDictionary<long, IReadOnlyList<DataItem>>> Completion { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    }
}
