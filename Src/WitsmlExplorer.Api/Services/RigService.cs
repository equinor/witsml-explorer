using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.Rig;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IRigService
    {
        Task<IEnumerable<Rig>> GetRigs(string wellUid, string wellboreUid);
        Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid);
    }

    public class RigService : WitsmlService, IRigService
    {
        public RigService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<Rig>> GetRigs(string wellUid, string wellboreUid)
        {
            WitsmlRigs witsmlRigs = RigQueries.GetWitsmlRigByWellbore(wellUid, wellboreUid);
            WitsmlRigs result = await _witsmlClient.GetFromStoreAsync(witsmlRigs, new OptionsIn(ReturnElements.All));
            return result.Rigs.Select(WitsmlRigToRig).OrderBy(rig => rig.Name);
        }

        public async Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid)
        {
            WitsmlRigs query = RigQueries.GetWitsmlRigById(wellUid, wellboreUid, rigUid);
            WitsmlRigs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            WitsmlRig witsmlRig = result.Rigs.FirstOrDefault();

            return WitsmlRigToRig(witsmlRig);
        }

        private static Rig WitsmlRigToRig(WitsmlRig witsmlRig)
        {
            return (witsmlRig == null) ? null : new Rig
            {
                AirGap = witsmlRig.AirGap == null ? null : new LengthMeasure { Uom = witsmlRig.AirGap.Uom, Value = StringHelpers.ToDecimal(witsmlRig.AirGap.Value) },
                Approvals = witsmlRig.Approvals,
                ClassRig = witsmlRig.ClassRig,
                DTimStartOp = witsmlRig.DTimStartOp,
                DTimEndOp = witsmlRig.DTimEndOp,
                EmailAddress = witsmlRig.EmailAddress,
                FaxNumber = witsmlRig.FaxNumber,
                IsOffshore = witsmlRig.IsOffshore == null ? null : StringHelpers.ToBooleanSafe(witsmlRig.IsOffshore),
                Owner = witsmlRig.Owner,
                Manufacturer = witsmlRig.Manufacturer,
                Name = witsmlRig.Name,
                NameContact = witsmlRig.NameContact,
                WellName = witsmlRig.NameWell,
                WellboreName = witsmlRig.NameWellbore,
                Registration = witsmlRig.Registration,
                RatingDrillDepth = witsmlRig.RatingDrillDepth == null ? null : new LengthMeasure { Uom = witsmlRig.RatingDrillDepth.Uom, Value = StringHelpers.ToDecimal(witsmlRig.RatingDrillDepth.Value) },
                RatingWaterDepth = witsmlRig.RatingWaterDepth == null ? null : new LengthMeasure { Uom = witsmlRig.RatingWaterDepth.Uom, Value = StringHelpers.ToDecimal(witsmlRig.RatingWaterDepth.Value) },
                TelNumber = witsmlRig.TelNumber,
                TypeRig = witsmlRig.TypeRig,
                Uid = witsmlRig.Uid,
                WellUid = witsmlRig.UidWell,
                WellboreUid = witsmlRig.UidWellbore,
                YearEntService = witsmlRig.YearEntService,
                CommonData = new CommonData()
                {
                    ItemState = witsmlRig.CommonData.ItemState,
                    SourceName = witsmlRig.CommonData.SourceName,
                    DTimLastChange = witsmlRig.CommonData.DTimLastChange,
                    DTimCreation = witsmlRig.CommonData.DTimCreation,
                }
            };
        }
    }
}
