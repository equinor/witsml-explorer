using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    /// <summary>
    /// Job for modifying trajectory.
    /// </summary>
    public record ModifyTrajectoryJob : Job
    {
        /// <summary>
        /// Trajectory API model.
        /// </summary>
        public Trajectory Trajectory { get; init; }

        /// <summary>
        /// Getting description of modified trajectory.
        /// </summary>
        /// <returns>String of job info which provide Trajectory Uid, WellUid, WellboreUid.</returns>
        public override string Description()
        {
            return $"ToModify - WellUid: {Trajectory.WellUid}; WellboreUid: {Trajectory.WellboreUid}; TrajectoryUid: {Trajectory.Uid};";
        }

        /// <summary>
        /// Getting name of trajectory.
        /// </summary>
        /// <returns>String of trajectory name.</returns>
        public override string GetObjectName()
        {
            return Trajectory.Name;
        }

        /// <summary>
        /// Getting name of wellbore.
        /// </summary>
        /// <returns>String of wellbore name.</returns>
        public override string GetWellboreName()
        {
            return Trajectory.WellboreName;
        }

        /// <summary>
        /// Getting name of well.
        /// </summary>
        /// <returns>String of well name.</returns>
        public override string GetWellName()
        {
            return Trajectory.WellName;
        }
    }
}
