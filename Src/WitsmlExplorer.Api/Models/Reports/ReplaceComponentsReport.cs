namespace WitsmlExplorer.Api.Models.Reports;

/// <summary>
/// The report of copies components.
/// </summary>
public class ReplaceComponentsReport : BaseReport
{
    /// <summary>
    /// Log object data.
    /// </summary>
    public LogObject LogReference { get; init; }
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
    public string Status { get; set; }
}
