namespace WitsmlExplorer.Api.Models.Reports
{
    public class BatchModifyReport : BaseReport
    {
    }

    public class BatchModifyReportItem
    {
        public string WellUid { get; init; }
        public string WellboreUid { get; init; }
        public string Uid { get; init; }
        public string IsSuccessful { get; init; }
        public string FailureReason { get; init; }
    }
}
