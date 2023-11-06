using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class StnTrajValid
    {
        public LengthMeasure MagTotalFieldCalc { get; init; }
        public LengthMeasure MagDipAngleCalc { get; init; }
        public LengthMeasure GravTotalFieldCalc { get; init; }
    }
}
