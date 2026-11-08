using System.Collections.Generic;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DecimalComparisonMode
{
    ServerSettings,
    AppSettings,
    Custom,
    Raw
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TimezoneComparisonMode
{
    Utc,
    AppSettings,
    Raw
}

public record LogMapping
{
    public string SourceLogUid { get; init; }
    public string SourceLogName { get; init; }
    public string TargetLogUid { get; init; }
    public string TargetLogName { get; init; }
}

/// <summary>
/// Job for comparing sub objects of 2 wellbores.
/// </summary>
public record WellboreSubObjectsComparisonJob : Job
{

    public WellboreReference SourceWellbore { get; init; }

    public WellboreReference TargetWellbore { get; init; }

    public bool CompareWellboreMetadata { get; init; }

    public List<EntityType> ObjectTypesToCompare { get; init; }

    public bool CompareAllObjects { get; init; } = true;

    public bool DeepCompareObjects { get; init; } = true;

    public bool MatchByNameIfUidDiffers { get; init; } = false;

    public List<LogMapping> LogMappings { get; init; }

    public bool OmitCustomData { get; init; } = true;

    public bool OmitTimestamps { get; init; } = true;

    public DecimalComparisonMode DecimalMode { get; init; } = DecimalComparisonMode.ServerSettings;

    public int? CustomDecimalPlaces { get; init; }

    public TimezoneComparisonMode TimezoneMode { get; init; } = TimezoneComparisonMode.Utc;

    public string Timezone { get; init; }

    public bool ReportAllMismatches { get; init; } = true;

    public int? MaxLogDataMismatches { get; init; }

    public bool CountLogsData { get; init; }

    public bool CheckLogsData { get; init; }

    public bool CheckTimeBasedLogsData { get; init; }
    public bool CheckDepthBasedLogsData { get; init; }

    public bool CompareDepthLogs { get; init; } = true;
    public bool CompareTimeLogs { get; init; } = true;
    public List<string> SpecificLogUidsOrNames { get; init; }
    public List<string> SpecificMnemonics { get; init; }

    public double? DepthInterval { get; init; }
    public string DepthStartIndex { get; init; }
    public string DepthEndIndex { get; init; }

    public double? TimeIntervalSeconds { get; init; }
    public string TimeStartIndex { get; init; }
    public string TimeEndIndex { get; init; }

    /// <summary>
    /// Indicates, if the job can be cancelled
    /// </summary>
    protected override bool IsCancelable => true;

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
