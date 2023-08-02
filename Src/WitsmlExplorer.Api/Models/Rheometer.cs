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
}
