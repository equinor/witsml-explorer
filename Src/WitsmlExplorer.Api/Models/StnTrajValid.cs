using Witsml.Data;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class StnTrajValid
    {
        public LengthMeasure MagTotalFieldCalc { get; init; }
        public LengthMeasure MagDipAngleCalc { get; init; }
        public LengthMeasure GravTotalFieldCalc { get; init; }
    }

    public static class StnTrajValidExtensions
    {
        public static WitsmlStnTrajValid ToWitsml(this StnTrajValid stnTrajValid)
        {
            return new WitsmlStnTrajValid
            {
                MagTotalFieldCalc = stnTrajValid.MagTotalFieldCalc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                MagDipAngleCalc = stnTrajValid.MagDipAngleCalc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                GravTotalFieldCalc = stnTrajValid.GravTotalFieldCalc?.ToWitsml<Witsml.Data.Measures.Measure>()
            };
        }
    }
}
