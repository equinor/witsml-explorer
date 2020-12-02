using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class CopyTrajectoryJob
    {
        public TrajectoryReference Source { get; set; }
        public WellboreReference Target { get; set; }
    }
}
