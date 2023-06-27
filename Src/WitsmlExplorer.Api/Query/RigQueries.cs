using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.Rig;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Query
{
    public static class RigQueries
    {
        public static WitsmlRigs GetWitsmlRig(string wellUid, string wellboreUid, string rigUid = "")
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    AirGap = Measure.ToFetch<WitsmlLengthMeasure>(),
                    Approvals = "",
                    ClassRig = "",
                    DTimStartOp = "",
                    DTimEndOp = "",
                    EmailAddress = "",
                    FaxNumber = "",
                    IsOffshore = "",
                    Manufacturer = "",
                    Name = "",
                    NameContact = "",
                    Owner = "",
                    Registration = "",
                    RatingDrillDepth = Measure.ToFetch<WitsmlLengthMeasure>(),
                    RatingWaterDepth = Measure.ToFetch<WitsmlLengthMeasure>(),
                    TelNumber = "",
                    TypeRig = "",
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    YearEntService = "",
                    CommonData = new WitsmlCommonData()
                    {
                        DTimCreation = "",
                        DTimLastChange = "",
                        ItemState = ""
                    }
                }.AsSingletonList()
            };
        }

        public static WitsmlRigs QueryByIds(string wellUid, string wellboreUid, string[] rigUids)
        {
            return new WitsmlRigs
            {
                Rigs = rigUids.Select((rigUid) => new WitsmlRig
                {
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static WitsmlRigs CreateRig(Rig rig)
        {
            return new()
            {
                Rigs = new WitsmlRig
                {
                    UidWell = rig.WellUid,
                    NameWell = rig.WellName,
                    NameWellbore = rig.WellboreName,
                    Uid = rig.Uid,
                    AirGap = rig.AirGap != null ? new WitsmlLengthMeasure { Uom = rig.AirGap.Uom, Value = rig.AirGap.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    Name = rig.Name,
                    TypeRig = rig.TypeRig,
                    Owner = rig.Owner.NullIfEmpty(),
                    UidWellbore = rig.WellboreUid,
                    Approvals = rig.Approvals.NullIfEmpty(),
                    ClassRig = rig.ClassRig.NullIfEmpty(),
                    DTimStartOp = StringHelpers.ToUniversalDateTimeString(rig.DTimStartOp),
                    DTimEndOp = StringHelpers.ToUniversalDateTimeString(rig.DTimEndOp),
                    EmailAddress = rig.EmailAddress,
                    FaxNumber = rig.FaxNumber,
                    IsOffshore = StringHelpers.OptionalBooleanToString(rig.IsOffshore),
                    Manufacturer = rig.Manufacturer.NullIfEmpty(),
                    NameContact = rig.NameContact,
                    RatingDrillDepth = rig.RatingDrillDepth != null ? new WitsmlLengthMeasure { Uom = rig.RatingDrillDepth.Uom, Value = rig.RatingDrillDepth.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    RatingWaterDepth = rig.RatingWaterDepth != null ? new WitsmlLengthMeasure { Uom = rig.RatingWaterDepth.Uom, Value = rig.RatingWaterDepth.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    Registration = rig.Registration.NullIfEmpty(),
                    TelNumber = rig.TelNumber,
                    YearEntService = rig.YearEntService,
                    CommonData = rig.CommonData == null ? null : new WitsmlCommonData()
                    {
                        SourceName = rig.CommonData.SourceName,
                        DTimCreation = null,
                        DTimLastChange = null,
                        ItemState = rig.CommonData.ItemState,
                    }
                }.AsSingletonList()
            };
        }
    }
}
