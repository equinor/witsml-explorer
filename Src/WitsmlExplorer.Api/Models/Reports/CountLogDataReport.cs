namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// The report contains the number of rows for each mnemonic.
/// </summary>
public class CountLogDataReport : BaseReport
{
    /// <summary>
    /// Log object data.
    /// </summary>
    public LogObject LogReference { get; init; }
}

/// <summary>
/// The item contains the number of log data rows for the mnemonic.
/// </summary>
public class CountLogDataReportItem
{
    /// <summary>
    /// Mnemonic identifier.
    /// </summary>
    public string Mnemonic { get; set; }

    /// <summary>
    /// Number of logData rows.
    /// </summary>
    public int LogDataCount { get; set; }
}
