using System;
using System.Collections.Generic;

using Energistics.Datatypes.ChannelData;

using Witsml.ETP;

namespace WitsmlExplorer.Api.Services.ETP
{
    internal sealed class EtpLogStreamState
    {
        private const string DefaultStreamId = "default-stream";
        private readonly object _syncRoot = new();
        private readonly Dictionary<string, EtpLogStreamStateSnapshot> _statesByStreamId = new();

        private static string NormalizeStreamId(string streamId)
        {
            return string.IsNullOrWhiteSpace(streamId) ? DefaultStreamId : streamId;
        }

        public void Set(
            string streamId,
            Dictionary<long, ChannelMetadataRecord> channelRecordsById,
            Dictionary<long, string> channelMnemonicById,
            string indexCurveMnemonic,
            string indexUom,
            string direction,
            bool isTimeBased,
            IEtpClient client)
        {
            var key = NormalizeStreamId(streamId);
            lock (_syncRoot)
            {
                _statesByStreamId[key] = new EtpLogStreamStateSnapshot(
                    new Dictionary<long, ChannelMetadataRecord>(channelRecordsById),
                    new Dictionary<long, string>(channelMnemonicById),
                    indexCurveMnemonic,
                    indexUom,
                    direction,
                    isTimeBased,
                    client);
            }
        }

        public EtpLogStreamStateSnapshot GetSnapshot(string streamId)
        {
            var key = NormalizeStreamId(streamId);
            lock (_syncRoot)
            {
                return _statesByStreamId.TryGetValue(key, out var snapshot)
                    ? snapshot
                    : new EtpLogStreamStateSnapshot(
                        new Dictionary<long, ChannelMetadataRecord>(),
                        new Dictionary<long, string>(),
                        null,
                        null,
                        null,
                        false,
                        null);
            }
        }

        public void Clear(string streamId)
        {
            var key = NormalizeStreamId(streamId);
            lock (_syncRoot)
            {
                _statesByStreamId.Remove(key);
            }
        }
    }

    internal sealed class EtpLogStreamStateSnapshot
    {
        public EtpLogStreamStateSnapshot(
            Dictionary<long, ChannelMetadataRecord> channelRecordsById,
            Dictionary<long, string> channelMnemonicById,
            string indexCurveMnemonic,
            string indexUom,
            string direction,
            bool isTimeBased,
            IEtpClient client)
        {
            ChannelRecordsById = channelRecordsById;
            ChannelMnemonicById = channelMnemonicById;
            IndexCurveMnemonic = indexCurveMnemonic;
            IndexUom = indexUom;
            Direction = direction;
            IsTimeBased = isTimeBased;
            Client = client;
        }

        public Dictionary<long, ChannelMetadataRecord> ChannelRecordsById { get; }
        public Dictionary<long, string> ChannelMnemonicById { get; }
        public string IndexCurveMnemonic { get; }
        public string IndexUom { get; }
        public string Direction { get; }
        public bool IsTimeBased { get; }
        public IEtpClient Client { get; }
    }
}
