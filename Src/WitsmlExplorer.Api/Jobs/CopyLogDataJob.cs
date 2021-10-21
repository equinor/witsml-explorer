using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyLogDataJob
    {
        public LogCurvesReference SourceLogCurvesReference { get; init; }
        public LogReference TargetLogReference { get; init; }
    }
}
