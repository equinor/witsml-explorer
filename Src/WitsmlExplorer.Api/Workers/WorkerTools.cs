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
            var query = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }

        public static async Task<WitsmlLog> GetLog(IWitsmlClient client, LogReference logReference, ReturnElements optionsInReturnElements)
        {
            var logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
            var result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));
            return !result.Logs.Any() ? null : result.Logs.First();
        }

    }
}
