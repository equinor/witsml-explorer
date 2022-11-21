using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class BhaRun : ObjectOnWellbore
    {
        public string NumStringRun { get; set; }
        public string Tubular { get; set; }
        public string TubularUidRef { get; set; }
        public string DTimStart { get; set; }
        public string DTimStop { get; set; }
        public string DTimStartDrilling { get; set; }
        public string DTimStopDrilling { get; set; }
        public LengthMeasure PlanDogleg { get; set; }
        public LengthMeasure ActDogleg { get; set; }
        public LengthMeasure ActDoglegMx { get; set; }
        public string StatusBha { get; set; }
        public string NumBitRun { get; set; }
        public string ReasonTrip { get; set; }
        public string ObjectiveBha { get; set; }
        public CommonData CommonData { get; set; }
    }
}
