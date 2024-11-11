using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
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

            return result.Tubulars.Select(WitsmlToTubular).OrderBy(tubular => tubular.Name).ToList();
        }

        public async Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid)
        {
            WitsmlTubulars witsmlTubular = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.Requested));

            return WitsmlToTubular(result.Tubulars.FirstOrDefault());
        }

        public async Task<ICollection<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid)
        {
            WitsmlTubulars tubularToQuery = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(tubularToQuery, new OptionsIn(ReturnElements.All));
            WitsmlTubular witsmlTubular = result.Tubulars.FirstOrDefault();
            return witsmlTubular?.TubularComponents?.Select(tComponent => new TubularComponent
            {
                Uid = tComponent.Uid,
                TypeTubularComponent = tComponent.TypeTubularComp,
                Sequence = tComponent.Sequence,
                Description = tComponent.Description,
                Id = tComponent.Id == null ? null : new LengthMeasure { Uom = tComponent.Id.Uom, Value = decimal.Parse(tComponent.Id.Value, CultureInfo.InvariantCulture) },
                Od = tComponent.Od == null ? null : new LengthMeasure { Uom = tComponent.Od.Uom, Value = decimal.Parse(tComponent.Od.Value, CultureInfo.InvariantCulture) },
                Len = tComponent.Len == null ? null : new LengthMeasure { Uom = tComponent.Len.Uom, Value = decimal.Parse(tComponent.Len.Value, CultureInfo.InvariantCulture) },
                NumJointStand = tComponent.NumJointStand,
                WtPerLen = tComponent.WtPerLen == null ? null : new LengthMeasure { Uom = tComponent.WtPerLen.Uom, Value = decimal.Parse(tComponent.WtPerLen.Value, CultureInfo.InvariantCulture) },
                ConfigCon = tComponent.ConfigCon,
                TypeMaterial = tComponent.TypeMaterial,
                Vendor = tComponent.Vendor,
                Model = tComponent.Model
            }).OrderBy(tComponent => tComponent.Sequence).ToList();
        }

        private static Tubular WitsmlToTubular(WitsmlTubular tubular)
        {
            return tubular == null ? null : new Tubular
            {
                Uid = tubular.Uid,
                WellUid = tubular.UidWell,
                WellboreUid = tubular.UidWellbore,
                Name = tubular.Name,
                WellName = tubular.NameWell,
                WellboreName = tubular.NameWellbore,
                TypeTubularAssy = tubular.TypeTubularAssy,
                CommonData = new CommonData()
                {
                    DTimCreation = tubular.CommonData.DTimCreation,
                    DTimLastChange = tubular.CommonData.DTimLastChange
                }
            };
        }
    }
}
