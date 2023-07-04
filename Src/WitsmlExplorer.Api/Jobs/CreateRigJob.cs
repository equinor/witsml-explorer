using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

/// <summary>
/// Job for create rig with jobInfo.
/// </summary>
public record CreateRigJob : Job
{
    /// <summary>
    /// Rig API model.
    /// </summary>
    public Rig Rig { get; init; }

    /// <summary>
    /// Getting description of created rig.
    /// </summary>
    /// <returns>String of job info which provide WellUid, WellboreUid and RigUid.</returns>
    public override string Description()
    {
        return $"Create Rig - Uid: {Rig.Uid}; Name: {Rig.Name}; WellUid: {Rig.WellUid}; WellboreUid: {Rig.WellboreUid};";
    }

    /// <summary>
    /// Getting name of rig.
    /// </summary>
    /// <returns>String of rig name.</returns>
    public override string GetObjectName()
    {
        return Rig.Name;
    }

    /// <summary>
    /// Getting name of wellbore.
    /// </summary>
    /// <returns>String of wellbore name.</returns>
    public override string GetWellboreName()
    {
        return Rig.WellboreName;
    }

    /// <summary>
    /// Getting name of well.
    /// </summary>
    /// <returns>String of well name.</returns>
    public override string GetWellName()
    {
        return Rig.WellName;
    }
}
