using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface ITubularService
    {
        Task<ICollection<Tubular>> GetTubulars(string wellUid, string wellboreUid);
        Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid);
        Task<ICollection<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid);
    }

    public class TubularService : WitsmlService, ITubularService
    {
        public TubularService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<ICollection<Tubular>> GetTubulars(string wellUid, string wellboreUid)
        {
            WitsmlTubulars witsmlTubular = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid);
            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.Requested));

            return result.Tubulars.Select(Tubular.FromWitsml).OrderBy(tubular => tubular.Name).ToList();
        }

        public async Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid)
        {
            WitsmlTubulars witsmlTubular = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.Requested));

            return Tubular.FromWitsml(result.Tubulars.FirstOrDefault());
        }

        public async Task<ICollection<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid)
        {
            WitsmlTubulars tubularToQuery = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(tubularToQuery, new OptionsIn(ReturnElements.All));
            return Tubular.GetTubularComponents(result.Tubulars.FirstOrDefault()?.TubularComponents);
        }
    }
}
