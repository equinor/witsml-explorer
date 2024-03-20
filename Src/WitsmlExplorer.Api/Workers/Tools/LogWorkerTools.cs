using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs.Common.Interfaces;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public static class LogWorkerTools
    {
        public static async Task<WitsmlLog> GetLog(IWitsmlClient client, IObjectReference logReference, ReturnElements optionsInReturnElements)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.Uid);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));
            WitsmlLog log = result.Logs.FirstOrDefault();

            log?.EnsureIndexCurveIsFirst();

            return log;
        }

        public static async Task<WitsmlLogs> GetLogsByIds(IWitsmlClient client, string wellUid, string wellboreUid, string[] logUids, ReturnElements optionsInReturnElements)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogsByIds(wellUid, wellboreUid, logUids);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));

            result?.EnsureIndexCurveIsFirst();

            return result;
        }

        public static async Task<WitsmlLogData> GetLogDataForCurve(IWitsmlClient witsmlClient, WitsmlLog log, string mnemonic, ILogger logger)
        {
            await using LogDataReader logDataReader = new(witsmlClient, log, mnemonic.AsItemInList(), logger);
            List<WitsmlData> data = new();
            WitsmlLogData logData = await logDataReader.GetNextBatch();
            var mnemonicList = logData?.MnemonicList;
            var unitList = logData?.UnitList;
            while (logData != null)
            {
                data.AddRange(logData.Data);
                logData = await logDataReader.GetNextBatch();
            }

            return new WitsmlLogData
            {
                MnemonicList = mnemonicList,
                UnitList = unitList,
                Data = data
            };
        }

        public static double CalculateProgressBasedOnIndex(WitsmlLog log, WitsmlLogData currentData)
        {
            string index = currentData.Data.LastOrDefault()?.Data.Split(CommonConstants.DataSeparator).FirstOrDefault();
            if (index == null) return 0;
            if (log.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
            {
                string startIndex = log.StartIndex.Value;
                string endIndex = log.EndIndex.Value;
                return (StringHelpers.ToDouble(index) - StringHelpers.ToDouble(startIndex)) / (StringHelpers.ToDouble(endIndex) - StringHelpers.ToDouble(startIndex));
            }
            else
            {
                string startIndex = log.StartDateTimeIndex;
                string endIndex = log.EndDateTimeIndex;
                return (DateTime.Parse(index) - DateTime.Parse(startIndex)).TotalMilliseconds / (DateTime.Parse(endIndex) - DateTime.Parse(startIndex)).TotalMilliseconds;
            }
        }
    }
}
