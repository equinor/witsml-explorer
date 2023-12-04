using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Rheometer
    {
        public string Uid { get; set; }
        public LengthMeasure TempRheom { get; set; }
        public LengthMeasure PresRheom { get; set; }
        public string Vis3Rpm { get; set; }
        public string Vis6Rpm { get; set; }
        public string Vis100Rpm { get; set; }
        public string Vis200Rpm { get; set; }
        public string Vis300Rpm { get; set; }
        public string Vis600Rpm { get; set; }
    }

    public static class RheometerExtensions
    {
        public static WitsmlRheometer ToWitsml(this Rheometer rheometer)
        {
            return new WitsmlRheometer
            {
                Uid = rheometer.Uid,
                TempRheom = rheometer.TempRheom?.ToWitsml<WitsmlThermodynamicTemperatureMeasure>(),
                PresRheom = rheometer.PresRheom?.ToWitsml<WitsmlPressureMeasure>(),
                Vis3Rpm = rheometer.Vis3Rpm,
                Vis6Rpm = rheometer.Vis6Rpm,
                Vis100Rpm = rheometer.Vis100Rpm,
                Vis200Rpm = rheometer.Vis200Rpm,
                Vis300Rpm = rheometer.Vis300Rpm,
                Vis600Rpm = rheometer.Vis600Rpm
            };
        }
    }
}
