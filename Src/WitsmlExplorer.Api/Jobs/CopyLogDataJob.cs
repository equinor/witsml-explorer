using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class CopyLogDataJob
    {
        public LogCurvesReference SourceLogCurvesReference { get; set; }
        public LogReference TargetLogReference { get; set; }
    }
}
