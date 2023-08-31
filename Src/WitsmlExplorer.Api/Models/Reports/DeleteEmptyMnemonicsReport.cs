using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Models.Reports
{
    public class DeleteEmptyMnemonicsReport : BaseReport
    {
    }

    public class DeleteEmptyMnemonicsReportItem
    {
        public string WellName { get; init; }
        public string WellUid { get; init; }
        public string WellboreName { get; init; }
        public string WellboreUid { get; init; }
        public string LogName { get; init; }
        public string LogUid { get; init; }
        public string LogIndexType { get; init; }
        public string Mnemonic { get; init; }
    }
}
