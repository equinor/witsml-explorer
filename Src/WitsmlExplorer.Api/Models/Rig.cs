using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.Rig;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class Rig : ObjectOnWellbore
    {
        public LengthMeasure AirGap { get; init; }
        public string Approvals { get; init; }
        public string ClassRig { get; init; }
        public string DTimStartOp { get; init; }
        public string DTimEndOp { get; init; }
        public string EmailAddress { get; init; }
        public string FaxNumber { get; init; }
        public bool? IsOffshore { get; init; }
        public string Manufacturer { get; init; }
        public string NameContact { get; init; }
        public string Owner { get; init; }
        public LengthMeasure RatingDrillDepth { get; init; }
        public LengthMeasure RatingWaterDepth { get; init; }
        public string Registration { get; init; }
        public string TelNumber { get; init; }
        public string TypeRig { get; init; }
        public string YearEntService { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlRigs ToWitsml()
        {
            return new WitsmlRig
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                AirGap = AirGap?.ToWitsml<WitsmlLengthMeasure>(),
                Approvals = Approvals,
                ClassRig = ClassRig,
                DTimStartOp = StringHelpers.ToUniversalDateTimeString(DTimStartOp),
                DTimEndOp = StringHelpers.ToUniversalDateTimeString(DTimEndOp),
                EmailAddress = EmailAddress,
                FaxNumber = FaxNumber,
                IsOffshore = StringHelpers.NullableBooleanToString(IsOffshore),
                Manufacturer = Manufacturer,
                NameContact = NameContact,
                Owner = Owner,
                RatingDrillDepth = RatingDrillDepth?.ToWitsml<WitsmlLengthMeasure>(),
                RatingWaterDepth = RatingWaterDepth?.ToWitsml<WitsmlLengthMeasure>(),
                Registration = Registration,
                TelNumber = TelNumber,
                TypeRig = TypeRig,
                YearEntService = YearEntService,
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }

        public static Rig FromWitsml(WitsmlRig witsmlRig)
        {
            return witsmlRig == null ? null : new Rig
            {
                AirGap = witsmlRig.AirGap == null ? null : new LengthMeasure { Uom = witsmlRig.AirGap.Uom, Value = StringHelpers.ToDecimal(witsmlRig.AirGap.Value) },
                Approvals = witsmlRig.Approvals,
                ClassRig = witsmlRig.ClassRig,
                DTimStartOp = witsmlRig.DTimStartOp,
                DTimEndOp = witsmlRig.DTimEndOp,
                EmailAddress = witsmlRig.EmailAddress,
                FaxNumber = witsmlRig.FaxNumber,
                IsOffshore = witsmlRig.IsOffshore == null ? null : StringHelpers.ToBoolean(witsmlRig.IsOffshore),
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
                CommonData = witsmlRig.CommonData == null ? null : new CommonData
                {
                    DTimCreation = witsmlRig.CommonData.DTimCreation,
                    DTimLastChange = witsmlRig.CommonData.DTimLastChange,
                    ItemState = witsmlRig.CommonData.ItemState
                }
            };
        }
    }
}
