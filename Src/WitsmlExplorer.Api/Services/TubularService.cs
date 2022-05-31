using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface ITubularService
    {
        Task<IEnumerable<Tubular>> GetTubulars(string wellUid, string wellboreUid);
        Task<IEnumerable<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid);
    }

    public class TubularService : WitsmlService, ITubularService
    {
        public TubularService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<IEnumerable<Tubular>> GetTubulars(string wellUid, string wellboreUid)
        {
            var witsmlTubular = TubularQueries.GetWitsmlTubularByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.Requested));

            return result.Tubulars.Select(tubular =>
                new Tubular
                {
                    Uid = tubular.Uid,
                    WellUid = tubular.UidWell,
                    WellboreUid = tubular.UidWellbore,
                    Name = tubular.Name,
                    TypeTubularAssy = tubular.TypeTubularAssy
                }).OrderBy(tubular => tubular.Name);
        }

        public async Task<IEnumerable<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid)
        {
            var tubularToQuery = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var result = await WitsmlClient.GetFromStoreAsync(tubularToQuery, new OptionsIn(ReturnElements.All));
            var witsmlTubular = result.Tubulars.FirstOrDefault();
            if (witsmlTubular == null) return null;
            return witsmlTubular.TubularComponents.Select(tComponent => new TubularComponent
            {
                Uid = tComponent.Uid,
                Sequence = tComponent.Sequence,
                Id = StringHelpers.ToDecimal(tComponent.Id?.Value),
                Od = StringHelpers.ToDecimal(tComponent.Od?.Value),
                Len = StringHelpers.ToDecimal(tComponent.Len?.Value),
                TypeTubularComponent = tComponent.TypeTubularComp,
            })
                .OrderBy(tComponent => tComponent.Sequence);
        }

    }
}
