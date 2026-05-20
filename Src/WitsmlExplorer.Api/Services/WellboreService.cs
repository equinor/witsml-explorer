using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IWellboreService
    {
        Task<Wellbore> GetWellbore(string wellUid, string wellboreUid);
        Task<Wellbore> GetWellboreByName(string wellboreName);
        Task<IList<Wellbore>> GetWellbores(string wellUid = "");
    }

    // ReSharper disable once UnusedMember.Global
    public class WellboreService : WitsmlService, IWellboreService
    {
        public WellboreService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<Wellbore> GetWellbore(string wellUid, string wellboreUid)
        {
            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(wellUid, wellboreUid);
            WitsmlWellbores result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            WitsmlWellbore witsmlWellbore = result.Wellbores.FirstOrDefault();
            return witsmlWellbore == null
                ? null
                : Wellbore.FromWitsml(witsmlWellbore);
        }

        public async Task<Wellbore> GetWellboreByName(string wellboreName)
        {
            return await MeasurementHelper.MeasureExecutionTimeAsync(async (timeMeasurer) =>
            {
                WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByName(wellboreName);
                WitsmlWellbores result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
                Wellbore wellbore = result.Wellbores
                    .Select(Wellbore.FromWitsml)
                    .OrderBy(wellbore => wellbore.Name).FirstOrDefault();
                timeMeasurer.LogMessage = executionTime => $"Fetched wellbore {wellbore.Name} in {executionTime} ms.";
                return wellbore;
            });
        }

        public async Task<IList<Wellbore>> GetWellbores(string wellUid = "")
        {
            return await MeasurementHelper.MeasureExecutionTimeAsync(async (timeMeasurer) =>
            {
                WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByWell(wellUid);
                WitsmlWellbores result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
                List<Wellbore> wellbores = result.Wellbores
                    .Select(Wellbore.FromWitsml)
                    .OrderBy(wellbore => wellbore.Name).ToList();
                timeMeasurer.LogMessage = executionTime => $"Fetched {wellbores.Count} wellbores in {executionTime} ms.";
                return wellbores;
            });
        }
    }
}
