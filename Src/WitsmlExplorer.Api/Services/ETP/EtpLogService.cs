using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.ChannelData;
using Energistics.Datatypes.Object;
using Energistics.Protocol.ChannelStreaming;

using Microsoft.AspNetCore.Mvc.Filters;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpLogService
    {
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken);
        Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken);
        Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end, bool loadAllData, CancellationToken? cancellationToken);
    }

    public class EtpLogService : EtpService, IEtpLogService
    {
        const int MaxRows = 10_000;
        private readonly IChannelMetadataMemoryCache _channelMetadataMemoryCache;

        public EtpLogService(IEtpClientProvider etpClientProvider, IChannelMetadataMemoryCache channelMetadataMemoryCache) : base(etpClientProvider)
        {
            _channelMetadataMemoryCache = channelMetadataMemoryCache;
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Log, logUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlLogs>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return LogObject.FromWitsml(objList.Logs.FirstOrDefault());
        }

        public async Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            throw new NotImplementedException("Index type is not part of a resource, which our UI relies on when listing logs. Implement this with workarounds either here or in the frontend.");
        }

        public async Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics,
            bool startIndexIsInclusive, string start, string end, bool loadAllData,CancellationToken? cancellationToken)
        {
            var ct = cancellationToken ?? CancellationToken.None;
            var client = await GetEtpClient(ct);

            var emls = new List<string>(mnemonics.Count);
            for (int i = 0; i < mnemonics.Count; i++)
            {
                emls.Add(EtpUriHelper.CreateChannelUri(wellUid, wellboreUid, logUid, mnemonics[i]));
            }

            _channelMetadataMemoryCache.ResetIfContextChanged(wellUid, wellboreUid, logUid);

            var channelLookup = new Dictionary<long, ChannelMetadata>();
            var missingEmls = new List<string>(emls.Count);

            foreach (var eml in emls)
            {
                if (_channelMetadataMemoryCache.TryGet(eml, out var cachedChannel))
                {
                    channelLookup[cachedChannel.channelId] = CreateSingleChannelMetadata(cachedChannel);
                }
                else
                {
                    missingEmls.Add(eml);
                }
            }

            if (missingEmls.Count > 0)
            {
                var fetchedChannelLookup = await client.GetChannelMetadataAsync(missingEmls, ct);
                if (fetchedChannelLookup != null)
                {
                    foreach (var metadata in fetchedChannelLookup.Values)
                    {
                        if (metadata?.channels == null)
                        {
                            continue;
                        }

                        foreach (var channel in metadata.channels)
                        {
                            if (string.IsNullOrWhiteSpace(channel?.channelUri))
                            {
                                continue;
                            }

                            _channelMetadataMemoryCache.Set(channel);
                            channelLookup[channel.channelId] = CreateSingleChannelMetadata(channel);
                        }
                    }
                }
            }

            if (channelLookup.Count == 0)
                return new LogData();

            var firstChannel = channelLookup.Values
                                .SelectMany(m => m.channels ?? Enumerable.Empty<Energistics.Datatypes.ChannelData.ChannelMetadataRecord>())
                                .FirstOrDefault();

            if (firstChannel?.indexes == null || firstChannel.indexes.Count == 0)
                return new LogData();

            var indexMetadata = firstChannel.indexes[0];
            bool isTimeBased = indexMetadata.indexType == Energistics.Datatypes.ChannelData.ChannelIndexTypes.Time;
            var indexCurveMnemonic = !string.IsNullOrWhiteSpace(indexMetadata.mnemonic)
                ? indexMetadata.mnemonic
                : (isTimeBased ? "time" : "depth");

            string indexUom = firstChannel.indexes[0].uom ?? "unitless";

            long startIndex = long.MinValue;
            long endIndex = long.MaxValue;

            if (isTimeBased)
            {
                if (DateTimeOffset.TryParse(start, out var startDt))
                    startIndex = startDt.ToUnixTimeMilliseconds() * 1000;

                if (DateTimeOffset.TryParse(end, out var endDt))
                    endIndex = endDt.ToUnixTimeMilliseconds() * 1000;
            }
            else
            {
                if (double.TryParse(start, out var s))
                    startIndex = (long)(s * 1000);

                if (double.TryParse(end, out var e))
                    endIndex = (long)(e * 1000);
            }

            var channelIds = new List<long>(channelLookup.Count);
            var channelRecords = new Dictionary<long, Energistics.Datatypes.ChannelData.ChannelMetadataRecord>(channelLookup.Count);
            var emlToMnemonic = new Dictionary<string, string>(emls.Count);

            for (int i = 0; i < emls.Count; i++)
                emlToMnemonic[emls[i]] = mnemonics[i];

            // Flatten + deduplicate in ONE PASS (avoid GroupBy)
            foreach (var metadata in channelLookup.Values)
            {
                if (metadata?.channels == null) continue;

                foreach (var ch in metadata.channels)
                {
                    if (!channelRecords.ContainsKey(ch.channelId))
                    {
                        channelRecords[ch.channelId] = ch;
                        channelIds.Add(ch.channelId);
                    }
                }
            }


            var channelMnemonicById = new Dictionary<long, string>(channelRecords.Count);
            foreach (var kvp in channelRecords)
            {
                var ch = kvp.Value;

                if (!string.IsNullOrEmpty(ch.channelUri) &&
                    emlToMnemonic.TryGetValue(ch.channelUri, out var mnemonic))
                {
                    channelMnemonicById[kvp.Key] = mnemonic;
                }
                else
                {
                    channelMnemonicById[kvp.Key] = ch.channelName;
                }
            }

            var channelData = await client.GetChannelRangeDataAsync(channelIds, startIndex, endIndex, MaxRows,  ct);

            var dataByIndex = new Dictionary<long, Dictionary<string, LogDataValue>>();

            foreach (var response in channelData)
            {
                if (response?.data == null) continue;

                foreach (var item in response.data)
                {
                    if (item?.indexes == null || item.indexes.Count == 0)
                        continue;

                    if (!channelMnemonicById.TryGetValue(item.channelId, out var mnemonic))
                        continue;

                    var indexValue = item.indexes[0];

                    if (!dataByIndex.TryGetValue(indexValue, out var row))
                    {
                        row = new Dictionary<string, LogDataValue>(8); // small initial capacity
                        dataByIndex[indexValue] = row;
                    }

                    if (item.value?.item != null)
                    {
                        row[mnemonic] = new LogDataValue(item.value.item.ToString());
                    }

                    if (!row.ContainsKey(indexCurveMnemonic))
                    {
                        var formattedIndexValue = isTimeBased
                            ? DateTimeOffset.FromUnixTimeMilliseconds(indexValue / 1000).ToString("O")
                            : (indexValue / 1000d).ToString(CultureInfo.InvariantCulture);

                        row[indexCurveMnemonic] = new LogDataValue(formattedIndexValue);
                    }
                }
            }


            var direction = firstChannel.indexes[0].direction.ToString();

            List<long> keys = [.. dataByIndex.Keys];

            if (string.Equals(direction, "Decreasing", StringComparison.OrdinalIgnoreCase))
            {
                keys.Sort((a, b) => b.CompareTo(a)); // reverse sort fatser
            }
            else
            {
                keys.Sort();
            }


            int limit = Math.Min(keys.Count, MaxRows);

            List<Dictionary<string, LogDataValue>> dataRows = new (limit);
            long? first = null;
            for (int i = 0; i < limit; i++)
            {
                var k = keys[i];
                var data = dataByIndex[k];
                dataRows.Add(data);
                first ??= k;
            }

            long? last = keys[limit - 1];

             var mnemonicLookup = channelRecords.Values.Where(x => !string.IsNullOrWhiteSpace(x.channelName)).ToDictionary(x => x.channelName, x => x.uom);

            List<CurveSpecification> curveSpecifications = new(channelMnemonicById.Count + 1);

            curveSpecifications.Add(new CurveSpecification
            {
                Mnemonic = indexCurveMnemonic,
                Unit = indexUom
            });

            foreach (var kv in channelMnemonicById)
            {
                string mnemonic = kv.Value;
                if (string.Equals(mnemonic, indexCurveMnemonic, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                string uom;

                // Use TryGetValue to avoid exceptions if key is missing
                mnemonicLookup.TryGetValue(mnemonic, out uom);
                uom ??= "";

                curveSpecifications.Add(new CurveSpecification
                {
                    Mnemonic = mnemonic,
                    Unit = uom 
                });
            }



            return new LogData
            {
                StartIndex = first?.ToString(CultureInfo.InvariantCulture) ?? start,
                EndIndex = last?.ToString(CultureInfo.InvariantCulture) ?? end,
                Direction = direction,
                CurveSpecifications = curveSpecifications,
                Data = dataRows
            };
        }

        private static ChannelMetadata CreateSingleChannelMetadata(ChannelMetadataRecord channelMetadataRecord)
        {
            return new ChannelMetadata
            {
                channels = new List<ChannelMetadataRecord> { channelMetadataRecord }
            };
        }

        public async Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Log, logUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlLogs>(uri, cancellationToken ?? CancellationToken.None);
            var witsmlLog = objList?.Logs?.FirstOrDefault();
            return witsmlLog?.LogCurveInfo.Select(LogObject.LogCurveInfoFromWitsml).ToList();
        }

        private LogObject MapResourceToLog(Resource resource)
        {
            return new LogObject
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Log),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri),
                CommonData = new CommonData
                {
                    DTimLastChange = ToUtcDateTimeLastChange(resource.lastChanged)
                }
            };
        }
    }
}
