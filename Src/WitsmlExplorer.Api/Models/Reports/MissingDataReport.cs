
namespace WitsmlExplorer.Api.Models.Reports
{
    public class MissingDataReport : BaseReport { }

    public class MissingDataReportItem
    {
        public string ObjectType { get; set; }
        public string Property { get; init; }
        public string WellUid { get; init; }
        public string WellName { get; init; }
        public string WellboreUid { get; init; }
        public string WellboreName { get; init; }
        public string ObjectUid { get; init; }
        public string ObjectName { get; init; }
    }
}
