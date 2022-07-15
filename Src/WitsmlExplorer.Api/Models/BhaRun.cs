using System;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class BhaRun
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string WellUid { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string WellboreUid { get; set; }
        public string NumStringRun { get; set; }
        public string TrajectoryUidRef { get; set; }
        public DateTime? DTimStart { get; set; }
        public DateTime? DTimStop { get; set; }
        public DateTime? DTimStartDrilling { get; set; }
        public DateTime? DTimStopDrilling { get; set; }
        public LengthMeasure PlanDogLeg { get; set; }
        public LengthMeasure actDogleg { get; set; }
        public LengthMeasure actDoglegMx { get; set; }
        public string statusBha { get; set; }
        public string NumBitRun { get; set; }
        public string ReasonTrip { get; set; }
        public string ObjectiveBha { get; set; }
        public CommonData CommonData { get; set; }

    }
}
