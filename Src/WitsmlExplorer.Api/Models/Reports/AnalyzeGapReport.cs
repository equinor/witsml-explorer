namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// The report of detected gaps.
/// </summary>
public class AnalyzeGapReport : BaseReport
{
    /// <summary>
    /// Log object data.
    /// </summary>
    public LogObject LogReference { get; init; }
}

/// <summary>
/// The item contains information of detected gaps. 
/// </summary>
public class AnalyzeGapReportItem
{
    /// <summary>
    /// Mnemonic identifier.
    /// </summary>
    public string Mnemonic { get; set; }
    /// <summary>
    /// Start of gap size.
    /// </summary>
    public string Start { get; set; }
    /// <summary>
    /// End of gap size.
    /// </summary>
    public string End { get; set; }
    /// <summary>
    /// Size of gap.
    /// </summary>
    public string GapSize { get; set; }
}


