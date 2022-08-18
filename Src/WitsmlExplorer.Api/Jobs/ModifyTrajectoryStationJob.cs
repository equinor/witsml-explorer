using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTrajectoryStationJob : IJob
    {
        public TrajectoryReference TrajectoryReference { get; init; }
        public TrajectoryStation TrajectoryStation { get; init; }

        public override string Description()
        {
            return $"ToModify - {TrajectoryReference.Description()} TrajectoryStationUid: {TrajectoryStation.Uid};";
        }
    }
}
