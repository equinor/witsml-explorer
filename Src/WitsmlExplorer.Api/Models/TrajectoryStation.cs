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
    }
}
