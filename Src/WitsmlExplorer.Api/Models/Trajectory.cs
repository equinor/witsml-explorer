using System.Collections.Generic;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class Trajectory : ObjectOnWellbore
    {
        public decimal? MdMin { get; internal set; }
        public decimal? MdMax { get; internal set; }
        public string AziRef { get; internal set; }
        public string DTimTrajStart { get; internal set; }
        public string DTimTrajEnd { get; internal set; }
        public List<TrajectoryStation> TrajectoryStations { get; internal set; }
        public string DateTimeCreation { get; internal set; }
        public string DateTimeLastChange { get; internal set; }
    }
}
