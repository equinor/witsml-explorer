using System.Collections.Generic;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class Trajectory : ObjectOnWellbore
    {
        public decimal? MdMin { get; init; }
        public decimal? MdMax { get; init; }
        public string AziRef { get; init; }
        public string DTimTrajStart { get; init; }
        public string DTimTrajEnd { get; init; }
        public List<TrajectoryStation> TrajectoryStations { get; init; }
        public string ServiceCompany { get; init; }
        public CommonData CommonData { get; init; }
    }
}
