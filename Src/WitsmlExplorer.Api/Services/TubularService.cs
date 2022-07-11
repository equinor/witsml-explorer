using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using System.Globalization;
using Witsml.Data.Tubular;

namespace WitsmlExplorer.Api.Services
{
    public interface ITubularService
    {
        Task<IEnumerable<Tubular>> GetTubulars(string wellUid, string wellboreUid);
        Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid);
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

            return result.Tubulars.Select(tubular => WitsmlToTubular(tubular)).OrderBy(tubular => tubular.Name);
        }

        public async Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid)
        {
            var witsmlTubular = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.Requested));

            if (result.Tubulars.Any())
            {
                return WitsmlToTubular(result.Tubulars.First());
            }

            return null;
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
                Id = tComponent.Id == null ? null : new LengthMeasure { Uom = tComponent.Id.Uom, Value = decimal.Parse(tComponent.Id.Value, CultureInfo.InvariantCulture) },
                Od = tComponent.Od == null ? null : new LengthMeasure { Uom = tComponent.Od.Uom, Value = decimal.Parse(tComponent.Od.Value, CultureInfo.InvariantCulture) },
                Len = tComponent.Len == null ? null : new LengthMeasure { Uom = tComponent.Len.Uom, Value = decimal.Parse(tComponent.Len.Value, CultureInfo.InvariantCulture) },
                TypeTubularComponent = tComponent.TypeTubularComp,
            })
                .OrderBy(tComponent => tComponent.Sequence);
        }

        private static Tubular WitsmlToTubular(WitsmlTubular tubular)
        {
            return new Tubular
            {
                Uid = tubular.Uid,
                WellUid = tubular.UidWell,
                WellboreUid = tubular.UidWellbore,
                Name = tubular.Name,
                TypeTubularAssy = tubular.TypeTubularAssy
            };
        }

    }
}
