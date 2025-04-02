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

/// <summary>
/// The item contains information of copy wellbore item.
/// </summary>
public class CopyWellboreWithObjectsReportItem
{
    /// <summary>
    /// Object identifier.
    /// </summary>
    public string Phase { get; set; }
    /// <summary>
    /// Name
    /// </summary>
    public string Name { get; set; }
    /// <summary>
    /// Uid
    /// </summary>
    public string Uid { get; set; }
    /// <summary>
    /// Message.
    /// </summary>
    public string Message { get; set; }
    /// <summary>
    /// Status of job.
    /// </summary>
    public string Status { get; set; }
}
