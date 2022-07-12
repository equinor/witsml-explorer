using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;
using Serilog;
using WitsmlExplorer.Api.Models.Measure;
using System.Globalization;

namespace WitsmlExplorer.Api.Services
{
    public interface IRigService
    {
        Task<IEnumerable<Rig>> GetRigs(string wellUid, string wellboreUid);
        Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class RigService : WitsmlService, IRigService
    {
        public RigService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<Rig>> GetRigs(string wellUid, string wellboreUid)
        {
            var witsmlRigs = RigQueries.GetWitsmlRigByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlRigs, new OptionsIn(ReturnElements.All));
            return result.Rigs.Select(rig =>
                new Rig
                {
                    AirGap = rig.AirGap == null ? null : new LengthMeasure { Uom = rig.AirGap.Uom, Value = decimal.Parse(rig.AirGap.Value) },
                    Approvals = rig.Approvals,
                    ClassRig = rig.ClassRig,
                    DTimStartOp = StringHelpers.ToDateTime(rig.DTimStartOp),
                    DTimEndOp = StringHelpers.ToDateTime(rig.DTimEndOp),
                    EmailAddress = rig.EmailAddress,
                    FaxNumber = rig.FaxNumber,
                    IsOffshore = rig.IsOffshoreText,
                    Manufacturer = rig.Manufacturer,
                    Name = rig.Name,
                    NameContact = rig.NameContact,
                    NameWell = rig.NameWell,
                    NameWellbore = rig.NameWellbore,
                    Owner = rig.Owner,
                    Uid = rig.Uid,
                    UidWell = rig.UidWell,
                    UidWellbore = rig.UidWellbore,
                    RatingDrillDepth = rig.RatingDrillDepth == null ? null : new LengthMeasure { Uom = rig.RatingDrillDepth.Uom, Value = decimal.Parse(rig.RatingDrillDepth.Value) },
                    RatingWaterDepth = rig.RatingWaterDepth == null ? null : new LengthMeasure { Uom = rig.RatingWaterDepth.Uom, Value = decimal.Parse(rig.RatingWaterDepth.Value) },
                    Registration = rig.Registration,
                    TelNumber = rig.TelNumber,
                    TypeRig = rig.TypeRig,
                    YearEntService = rig.YearEntService,

                }).OrderBy(rig => rig.Name);
        }

        public async Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid)
        {
            var query = RigQueries.GetWitsmlRigById(wellUid, wellboreUid, rigUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            var witsmlRig = result.Rigs.FirstOrDefault();
            if (witsmlRig == null) return null;

            return new Rig
            {
                AirGap = witsmlRig.AirGap == null ? null : new LengthMeasure { Uom = witsmlRig.AirGap.Uom, Value = decimal.Parse(witsmlRig.AirGap.Value) },
                Approvals = witsmlRig.Approvals,
                ClassRig = witsmlRig.ClassRig,
                DTimStartOp = StringHelpers.ToDateTime(witsmlRig.DTimStartOp),
                DTimEndOp = StringHelpers.ToDateTime(witsmlRig.DTimEndOp),
                EmailAddress = witsmlRig.EmailAddress,
                FaxNumber = witsmlRig.FaxNumber,
                IsOffshore = witsmlRig.IsOffshoreText,
                Owner = witsmlRig.Owner,
                Manufacturer = witsmlRig.Manufacturer,
                Name = witsmlRig.Name,
                NameContact = witsmlRig.NameContact,
                NameWell = witsmlRig.NameWell,
                NameWellbore = witsmlRig.NameWellbore,
                Registration = witsmlRig.Registration,
                RatingDrillDepth = witsmlRig.RatingDrillDepth == null ? null : new LengthMeasure { Uom = witsmlRig.RatingDrillDepth.Uom, Value = decimal.Parse(witsmlRig.RatingDrillDepth.Value) },
                RatingWaterDepth = witsmlRig.RatingWaterDepth == null ? null : new LengthMeasure { Uom = witsmlRig.RatingWaterDepth.Uom, Value = decimal.Parse(witsmlRig.RatingWaterDepth.Value) },
                TelNumber = witsmlRig.TelNumber,
                TypeRig = witsmlRig.TypeRig,
                Uid = witsmlRig.Uid,
                UidWell = witsmlRig.UidWell,
                UidWellbore = witsmlRig.UidWellbore,
                YearEntService = witsmlRig.YearEntService,

            };
        }
    }
}
