namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// Batch modification report for logCurveInfos.
/// </summary>
public class BatchModifyLogCurveInfoReport : BaseReport
{
}

/// <summary>
/// The item information about a batch modification is extended with LogUid.
/// </summary>
public class BatchModifyLogCurveInfoReportItem : BatchModifyReportItem
{
    /// <summary>
    /// Log unique identifier.
    /// </summary>
    public string LogUid { get; init; }
}
