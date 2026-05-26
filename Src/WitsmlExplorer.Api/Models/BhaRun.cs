using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class BhaRun : ObjectOnWellbore
    {
        public string NumStringRun { get; init; }
        public RefNameString Tubular { get; init; }
        public string DTimStart { get; init; }
        public string DTimStop { get; init; }
        public string DTimStartDrilling { get; init; }
        public string DTimStopDrilling { get; init; }
        public LengthMeasure PlanDogleg { get; init; }
        public LengthMeasure ActDogleg { get; init; }
        public LengthMeasure ActDoglegMx { get; init; }
        public string StatusBha { get; init; }
        public string NumBitRun { get; init; }
        public string ReasonTrip { get; init; }
        public string ObjectiveBha { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlBhaRuns ToWitsml()
        {
            return new WitsmlBhaRun
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                NumStringRun = NumStringRun,
                Tubular = Tubular?.ToWitsml(),
                StatusBha = StatusBha,
                NumBitRun = NumBitRun,
                ReasonTrip = ReasonTrip,
                ObjectiveBha = ObjectiveBha,
                PlanDogleg = PlanDogleg?.ToWitsml<WitsmlAnglePerLengthMeasure>(),
                ActDogleg = ActDogleg?.ToWitsml<WitsmlAnglePerLengthMeasure>(),
                ActDoglegMx = ActDoglegMx?.ToWitsml<WitsmlAnglePerLengthMeasure>(),
                DTimStart = StringHelpers.ToUniversalDateTimeString(DTimStart),
                DTimStop = StringHelpers.ToUniversalDateTimeString(DTimStop),
                DTimStartDrilling = StringHelpers.ToUniversalDateTimeString(DTimStartDrilling),
                DTimStopDrilling = StringHelpers.ToUniversalDateTimeString(DTimStopDrilling),
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }

        public static BhaRun FromWitsml(WitsmlBhaRun bhaRun)
        {
            return bhaRun == null ? null : new BhaRun
            {
                Uid = bhaRun.Uid,
                Name = bhaRun.Name,
                WellUid = bhaRun.UidWell,
                WellName = bhaRun.NameWell,
                WellboreName = bhaRun.NameWellbore,
                WellboreUid = bhaRun.UidWellbore,
                NumStringRun = bhaRun.NumStringRun,
                Tubular = (bhaRun.Tubular == null) ? null : new RefNameString
                {
                    UidRef = bhaRun.Tubular.UidRef,
                    Value = bhaRun.Tubular.Value
                },
                StatusBha = bhaRun.StatusBha ?? null,
                NumBitRun = bhaRun.NumBitRun,
                ReasonTrip = bhaRun.ReasonTrip,
                ObjectiveBha = bhaRun.ObjectiveBha,
                PlanDogleg = (bhaRun.PlanDogleg == null) ? null : new LengthMeasure { Uom = bhaRun.PlanDogleg.Uom, Value = StringHelpers.ToDecimal(bhaRun.PlanDogleg.Value) },
                ActDogleg = (bhaRun.ActDogleg == null) ? null : new LengthMeasure { Uom = bhaRun.ActDogleg.Uom, Value = StringHelpers.ToDecimal(bhaRun.ActDogleg.Value) },
                ActDoglegMx = (bhaRun.ActDoglegMx == null) ? null : new LengthMeasure { Uom = bhaRun.ActDoglegMx.Uom, Value = StringHelpers.ToDecimal(bhaRun.ActDoglegMx.Value) },
                DTimStart = bhaRun.DTimStart,
                DTimStop = bhaRun.DTimStop,
                DTimStartDrilling = bhaRun.DTimStartDrilling,
                DTimStopDrilling = bhaRun.DTimStopDrilling,
                CommonData = new CommonData()
                {
                    ItemState = bhaRun.CommonData?.ItemState,
                    SourceName = bhaRun.CommonData?.SourceName,
                    DTimLastChange = bhaRun.CommonData?.DTimLastChange,
                    DTimCreation = bhaRun.CommonData?.DTimCreation,
                    ServiceCategory = bhaRun.CommonData?.ServiceCategory,
                    Comments = bhaRun.CommonData?.Comments,
                    DefaultDatum = bhaRun.CommonData?.DefaultDatum,
                }
            };
        }
    }
}
