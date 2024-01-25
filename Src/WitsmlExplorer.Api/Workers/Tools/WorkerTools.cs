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
    }
}
