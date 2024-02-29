namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// The report contains all log rows.
/// </summary>
public class DownloadAllLogDataReport : BaseReport
{
    /// <summary>
    /// Log object data.
    /// </summary>
    public LogObject LogReference { get; init; }
}
