namespace WitsmlExplorer.Api.Models.Reports
{
    public class CheckLogHeaderReport : BaseReport
    {
        public LogObject LogReference { get; init; }
    }

    public class CheckLogHeaderReportItem
    {
        public string Mnemonic { get; init; }
        public string HeaderStartIndex { get; init; }
        public string DataStartIndex { get; init; }
        public string HeaderEndIndex { get; init; }
        public string DataEndIndex { get; init; }
    }
}
