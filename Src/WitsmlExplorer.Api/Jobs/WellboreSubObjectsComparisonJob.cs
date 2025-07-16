using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

/// <summary>
/// Job for comparing sub objects of 2 wellbores.
/// </summary>
public record WellboreSubObjectsComparisonJob : Job
{

    public WellboreReference SourceWellbore { get; init; }

    public WellboreReference TargetWellbore { get; init; }


    /// <summary>
    /// Gets a description
    /// </summary>
    /// <returns>A string of job information provides WellUid, WellboreUid, logIndexType and LogUid.</returns>
    public override string Description()
    {
        return $"Comparing sub objects of 2 wellbores - Uid: {SourceWellbore.WellboreUid}; SourceWellUid: {SourceWellbore.WellUid}; TargetWellboreUid: {TargetWellbore.WellboreUid}; TargetWellUid {TargetWellbore.WellboreUid};";
    }

    /// <summary>
    /// Gets a name of source wellbore.
    /// </summary>
    /// <returns>String of log object name.</returns>
    public override string GetObjectName()
    {
        return SourceWellbore.WellboreName;
    }

    /// <summary>
    /// Gets a name of wellbore.
    /// </summary>
    /// <returns>String of wellbore name.</returns>
    public override string GetWellboreName()
    {
        return SourceWellbore.WellboreName;
    }

    /// <summary>
    /// Gets a name of well.
    /// </summary>
    /// <returns>String of well name.</returns>
    public override string GetWellName()
    {
        return SourceWellbore.WellName;
    }
}
