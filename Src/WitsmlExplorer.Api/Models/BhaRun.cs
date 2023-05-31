using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class BhaRun : ObjectOnWellbore
    {
        public string NumStringRun { get; init; }
        public string Tubular { get; init; }
        public string TubularUidRef { get; init; }
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
    }
}
