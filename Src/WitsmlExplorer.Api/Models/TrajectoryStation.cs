using System;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class TrajectoryStation
    {
        public string Uid { get; internal set; }
        public DateTime? DTimStn { get; internal set; }
        public string TypeTrajStation { get; internal set; }
        public decimal Md { get; internal set; }
        public decimal? Tvd { get; internal set; }
        public decimal? Incl { get; internal set; }
        public decimal? Azi { get; internal set; }
    }
}
