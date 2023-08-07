using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

/// <summary>
/// Job for create trajectory with jobInfo.
/// </summary>
public record CreateTrajectoryJob : Job
{
    /// <summary>
    /// Trajectory API model.
    /// </summary>
    public Trajectory Trajectory { get; init; }

    /// <summary>
    /// Getting description of created trajectory.
    /// </summary>
    /// <returns>String of job info which provide Trajectory Uid and Name, WellUid, WellboreUid.</returns>
    public override string Description()
    {
        return $"Create Trajectory - Uid: {Trajectory.Uid}; Name: {Trajectory.Name}; WellUid: {Trajectory.WellUid}; WellboreUid: {Trajectory.WellboreUid};";
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
