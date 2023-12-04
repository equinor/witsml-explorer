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
    }
}
