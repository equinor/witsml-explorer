using System.Collections.Generic;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class Trajectory : ObjectOnWellbore
    {
        public decimal? MdMin { get; internal init; }
        public decimal? MdMax { get; internal init; }
        public string AziRef { get; internal init; }
        public string DTimTrajStart { get; internal init; }
        public string DTimTrajEnd { get; internal init; }
        public List<TrajectoryStation> TrajectoryStations { get; internal init; }
        public string DateTimeCreation { get; internal init; }
        public string DateTimeLastChange { get; internal init; }
    }
}
