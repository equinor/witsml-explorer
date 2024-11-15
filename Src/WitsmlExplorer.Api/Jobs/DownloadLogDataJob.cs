using System;
using System.Collections.Generic;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

/// <summary>
/// Job for downloading log data.
/// </summary>
public record DownloadLogDataJob : Job
{
    /// <summary>
    /// Log reference object
    /// </summary>
    public LogObject LogReference { get; init; }

    /// <summary>
    /// List of mnemonics
    /// </summary>
    public List<string> Mnemonics { get; init; }

    /// <summary>
    /// Is start index inclusive
    /// </summary>
    public bool StartIndexIsInclusive { get; init; }

    /// <summary>
    /// If to export to LAS format (default is CSV)
    /// </summary>
    public bool ExportToLas { get; init; }

    /// <summary>
    /// Start index for range selection
    /// </summary>
    public string StartIndex { get; init; }

    /// <summary>
    /// End index for range selection
    /// </summary>
    public string EndIndex { get; init; }

    /// <summary>
    /// Indicates, if the job can be cancelled
    /// </summary>
    public override bool IsCancelable => true;

    /// <summary>
    /// Gets a description of the log reference object.
    /// </summary>
    /// <returns>A string of job information provides WellUid, WellboreUid, logIndexType and LogUid.</returns>
    public override string Description()
    {
        return $"Downloading log data - Uid: {LogReference.Uid}; WellUid: {LogReference.WellUid}; WellboreUid: {LogReference.WellboreUid}; logIndexType {LogReference.IndexType};";
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
