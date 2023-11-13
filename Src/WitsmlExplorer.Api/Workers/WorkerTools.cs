using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Jobs.Common.Interfaces;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public static class WorkerTools
    {
        public static async Task<WitsmlWell> GetWell(IWitsmlClient client, WellReference wellReference, ReturnElements optionsInReturnElements = ReturnElements.Requested)
        {
            WitsmlWells query = WellQueries.GetWitsmlWellByUid(wellReference.WellUid);
            WitsmlWells wells = await client.GetFromStoreAsync(query, new OptionsIn(optionsInReturnElements));
            return !wells.Wells.Any() ? null : wells.Wells.First();
        }

        public static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference, ReturnElements optionsInReturnElements = ReturnElements.Requested, bool retry = false)
        {
            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            WitsmlWellbores wellbores = await client.GetFromStoreAsync(query, new OptionsIn(optionsInReturnElements));
            if (!wellbores.Wellbores.Any() && retry)
            {
                // retry the query after a delay in case we were unable to fetch a newly created wellbore
                await Task.Delay(10000);
                wellbores = await client.GetFromStoreAsync(query, new OptionsIn(optionsInReturnElements));
            }
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }

        public static async Task<WitsmlLog> GetLog(IWitsmlClient client, IObjectReference logReference, ReturnElements optionsInReturnElements)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.Uid);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));
            return !result.Logs.Any() ? null : result.Logs.First();
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
    }
}
