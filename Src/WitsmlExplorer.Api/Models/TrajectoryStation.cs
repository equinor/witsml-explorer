using WitsmlExplorer.Api.Models.Measure;
// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class TrajectoryStation
    {
        public string Uid { get; init; }
        public string DTimStn { get; init; }
        public string TypeTrajStation { get; init; }
        public LengthMeasure Md { get; init; }
        public LengthMeasure Tvd { get; init; }
        public LengthMeasure Incl { get; init; }
        public LengthMeasure Azi { get; init; }
        public LengthMeasure Dls { get; init; }
        public LengthMeasure Mtf { get; init; }
        public LengthMeasure Gtf { get; init; }
        public LengthMeasure DispNs { get; init; }
        public LengthMeasure DispEw { get; init; }
        public LengthMeasure VertSect { get; init; }
        public LengthMeasure RateTurn { get; init; }
        public LengthMeasure RateBuild { get; init; }
        public LengthMeasure GravTotalUncert { get; init; }
        public LengthMeasure DipAngleUncert { get; init; }
        public LengthMeasure MagTotalUncert { get; init; }
        public bool? SagCorUsed { get; init; }
        public bool? MagDrlstrCorUsed { get; init; }
        public LengthMeasure GravTotalFieldReference { get; init; }
        public LengthMeasure MagTotalFieldReference { get; init; }
        public LengthMeasure MagDipAngleReference { get; init; }
        public LengthMeasure StatusTrajStation { get; init; }
        public LengthMeasure GravAxialRaw { get; init; }
        public LengthMeasure GravTran1Raw { get; init; }
        public LengthMeasure GravTran2Raw { get; init; }
        public LengthMeasure MagAxialRaw { get; init; }
        public RawData RawData { get; init; }
        public StnTrajCorUsed CorUsed { get; init; }
        public StnTrajValid Valid { get; set; }
    }
}
