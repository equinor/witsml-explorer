using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTrajectoryStationJob : Job
    {
        public ObjectReference TrajectoryReference { get; init; }
        public TrajectoryStation TrajectoryStation { get; init; }

        public override string Description()
        {
            return $"ToModify - {TrajectoryReference.Description()} TrajectoryStationUid: {TrajectoryStation.Uid};";
        }

        public override string GetObjectName()
        {
            return TrajectoryReference.Name;
        }

        public override string GetWellboreName()
        {
            return TrajectoryReference.WellboreName;
        }

        public override string GetWellName()
        {
            return TrajectoryReference.WellName;
        }
    }
}
