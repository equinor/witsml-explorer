namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// Common copy report.
/// </summary>
public class CommonCopyReport : BaseReport
{
}

/// <summary>
/// The item contains information of replaced item.
/// </summary>
public class CommonCopyReportItem
{
    /// <summary>
    /// Object identifier.
    /// </summary>
    public string Phase { get; set; }
    /// <summary>
    /// Message.
    /// </summary>
    public string Message { get; set; }
    /// <summary>
    /// Status of job.
    /// </summary>
    public string Status { get; set; }
}
