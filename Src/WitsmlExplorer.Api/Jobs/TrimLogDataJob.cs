using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record TrimLogDataJob
    {
        public LogReference LogObject { get; init; }

        public string StartIndex { get; init; }

        public string EndIndex { get; init; }
    }
}
