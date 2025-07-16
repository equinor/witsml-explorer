using WitsmlExplorer.Api.Jobs.Common;

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
        return $"Comparing sub objects of 2 wellbores - SourceWellboreUid: {SourceWellbore.WellboreUid}; SourceWellUid: {SourceWellbore.WellUid}; TargetWellboreUid: {TargetWellbore.WellboreUid}; TargetWellUid {TargetWellbore.WellUid};";
    }

    /// <summary>
    /// Gets a name of object.
    /// </summary>
    /// <returns>String of log object name.</returns>
    public override string GetObjectName()
    {
        return null;
    }

    /// <summary>
    /// Gets a name of wellbore.
    /// </summary>
    /// <returns>String of wellbore name.</returns>
    public override string GetWellboreName()
    {
        return $"Source={SourceWellbore.WellboreName} Target={TargetWellbore.WellboreName}";
    }

    /// <summary>
    /// Gets a name of well.
    /// </summary>
    /// <returns>String of well name.</returns>
    public override string GetWellName()
    {
        return $"Source={SourceWellbore.WellName} Target={TargetWellbore.WellName}"; ;
    }
}
