using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class StnTrajCorUsed
    {
        public LengthMeasure GravAxialAccelCor { get; init; }
        public LengthMeasure GravTran1AccelCor { get; init; }
        public LengthMeasure GravTran2AccelCor { get; init; }
        public LengthMeasure MagAxialDrlstrCor { get; init; }
        public LengthMeasure MagTran1DrlstrCor { get; init; }
        public LengthMeasure MagTran2DrlstrCor { get; init; }
        public LengthMeasure SagIncCor { get; init; }
        public LengthMeasure StnMagDeclUsed { get; init; }
        public LengthMeasure StnGridCorUsed { get; init; }
        public LengthMeasure DirSensorOffset { get; init; }
    }
}
