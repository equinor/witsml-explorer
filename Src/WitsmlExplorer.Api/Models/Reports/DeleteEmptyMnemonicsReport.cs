using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Models.Reports
{
    public class DeleteEmptyMnemonicsReport : BaseReport
    {
    }

    public class DeleteEmptyMnemonicsReportItem
    {
        public WellboreReference WellboreReference { get; set; }
        public LogCurveInfo LogCurveInfo { get; set; }
    }
}
