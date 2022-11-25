using WitsmlExplorer.Api.Models.Measure;
// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class TrajectoryStation
    {
        public string Uid { get; set; }
        public string DTimStn { get; set; }
        public string TypeTrajStation { get; set; }
        public LengthMeasure Md { get; set; }
        public LengthMeasure Tvd { get; set; }
        public LengthMeasure Incl { get; set; }
        public LengthMeasure Azi { get; set; }
    }
}
