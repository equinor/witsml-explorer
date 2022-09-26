using System.Linq;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Workers
{
    public static class WorkerTools
    {
        public static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            WitsmlWellbores wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }

        public static async Task<WitsmlLog> GetLog(IWitsmlClient client, ObjectReference logReference, ReturnElements optionsInReturnElements)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.Uid);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));
            return !result.Logs.Any() ? null : result.Logs.First();
        }

        public static async Task<WitsmlLog> GetLog(IWitsmlClient client, string logUid, string wellboreUid, string wellUid, ReturnElements optionsInReturnElements)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));
            return !result.Logs.Any() ? null : result.Logs.First();
        }

    }
}
