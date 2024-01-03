using Witsml.Data;

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

    public static class StnTrajCorUsedExtensions
    {
        public static WitsmlStnTrajCorUsed ToWitsml(this StnTrajCorUsed stnTrajCorUsed)
        {
            return new WitsmlStnTrajCorUsed
            {
                GravAxialAccelCor = stnTrajCorUsed.GravAxialAccelCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                GravTran1AccelCor = stnTrajCorUsed.GravTran1AccelCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                GravTran2AccelCor = stnTrajCorUsed.GravTran2AccelCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                MagAxialDrlstrCor = stnTrajCorUsed.MagAxialDrlstrCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                MagTran1DrlstrCor = stnTrajCorUsed.MagTran1DrlstrCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                MagTran2DrlstrCor = stnTrajCorUsed.MagTran2DrlstrCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                SagIncCor = stnTrajCorUsed.SagIncCor?.ToWitsml<Witsml.Data.Measures.Measure>(),
                StnMagDeclUsed = stnTrajCorUsed.StnMagDeclUsed?.ToWitsml<Witsml.Data.Measures.Measure>(),
                StnGridCorUsed = stnTrajCorUsed.StnGridCorUsed?.ToWitsml<Witsml.Data.Measures.Measure>(),
                DirSensorOffset = stnTrajCorUsed.DirSensorOffset?.ToWitsml<Witsml.Data.Measures.Measure>()
            };
        }
    }
}
