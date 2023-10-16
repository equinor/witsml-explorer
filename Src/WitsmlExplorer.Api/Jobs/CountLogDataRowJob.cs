using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

/// <summary>
/// Job for counting how many values are in each curve.  
/// </summary>
public record CountLogDataRowJob : Job
{
    /// <summary>
    /// Log reference object
    /// </summary>
    public LogObject LogReference { get; init; }

    /// <summary>
    /// Gets a description of the log reference object.
    /// </summary>
    /// <returns>A string of job information provides WellUid, WellboreUid, logIndexType and LogUid.</returns>
    public override string Description()
    {
        return $"Counting log data values - Uid: {LogReference.Uid}; WellUid: {LogReference.WellUid}; WellboreUid: {LogReference.WellboreUid}; logIndexType {LogReference.IndexType};";
    }

    /// <summary>
    /// Gets a name of log reference object.
    /// </summary>
    /// <returns>String of log object name.</returns>
    public override string GetObjectName()
    {
        return LogReference.Name;
    }

    /// <summary>
    /// Gets a name of wellbore.
    /// </summary>
    /// <returns>String of wellbore name.</returns>
    public override string GetWellboreName()
    {
        return LogReference.WellboreName;
    }

    /// <summary>
    /// Gets a name of well.
    /// </summary>
    /// <returns>String of well name.</returns>
    public override string GetWellName()
    {
        return LogReference.WellName;
    }
}
