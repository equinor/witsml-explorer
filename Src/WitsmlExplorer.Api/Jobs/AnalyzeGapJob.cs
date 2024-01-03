using System.Collections.Generic;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

/// <summary>
/// Job for analyzing gaps.
/// </summary>
public record AnalyzeGapJob : Job
{
    /// <summary>
    /// Log reference object
    /// </summary>
    public LogObject LogReference { get; init; }

    /// <summary>
    /// Array of mnemonics names
    /// </summary>
    public ICollection<string> Mnemonics { get; init; }

    /// <summary>
    /// Size of the GAP for depth
    /// </summary>
    public double GapSize { get; set; }

    /// <summary>
    /// Size of the GAP for dateTime
    /// </summary>
    public long TimeGapSize { get; set; }

    /// <summary>
    /// Start index of the log for searching gaps.
    /// </summary>
    public string StartIndex { get; set; }

    /// <summary>
    /// End index of the log for searching gaps.
    /// </summary>
    public string EndIndex { get; set; }

    /// <summary>
    /// Getting description of log reference object.
    /// </summary>
    /// <returns>String of job info which provide WellUid, WellboreUid and LogUid.</returns>
    public override string Description()
    {
        return $"Analyzing gaps - Uid: {LogReference.Uid}; WellUid: {LogReference.WellUid}; WellboreUid: {LogReference.WellboreUid}; logIndexType {LogReference.IndexType};";
    }

    /// <summary>
    /// Getting name of log reference object.
    /// </summary>
    /// <returns>String of log object name.</returns>
    public override string GetObjectName()
    {
        return LogReference.Name;
    }

    /// <summary>
    /// Getting name of wellbore.
    /// </summary>
    /// <returns>String of wellbore name.</returns>
    public override string GetWellboreName()
    {
        return LogReference.WellboreName;
    }

    /// <summary>
    /// Getting name of well.
    /// </summary>
    /// <returns>String of well name.</returns>
    public override string GetWellName()
    {
        return LogReference.WellName;
    }
}
