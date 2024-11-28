namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// The report contains log rows.
/// </summary>
public class DownloadLogDataReport : BaseReport
{
    /// <summary>
    /// Log object data.
    /// </summary>
    public LogObject LogReference { get; init; }
}
