namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// The report of replaced components.
/// </summary>
public class ReplaceComponentsReport : BaseReport
{
}

/// <summary>
/// The item contains information of replaced item.
/// </summary>
public class ReplaceComponentsReportItem
{
    /// <summary>
    /// Object identifier.
    /// </summary>
    public string Object { get; set; }
    /// <summary>
    /// Message.
    /// </summary>
    public string Message { get; set; }
    /// <summary>
    /// Status of job.
    /// </summary>
    public string Status { get; set; }
}
