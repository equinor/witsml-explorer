namespace WitsmlExplorer.Api.Models.Reports;

public class WellboreSubObjectsComparisonReport : BaseReport { }

public class WellboreSubObjectsComparisonItem
{
    public string ObjectType { get; set; }
    public string LogType { get; set; }
    public string ObjectUid { get; init; }
    public string ObjectName { get; init; }
    public string Mnemonic { get; set; }
    public string ExistsOnSource { get; set; }
    public string ExistsOnTarget { get; set; }
    public string SourceStart { get; set; }
    public string TargetStart { get; set; }
    public string SourceEnd { get; set; }
    public string TargetEnd { get; set; }
    public string NumberOfMnemonicsOnSource { get; set; }
    public string NumberOfMnemonicsOnTarget { get; set; }
}
