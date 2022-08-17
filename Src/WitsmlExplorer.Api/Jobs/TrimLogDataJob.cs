using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record TrimLogDataJob : IJob
    {
        public LogReference LogObject { get; init; }

        public string StartIndex { get; init; }

        public string EndIndex { get; init; }

        public string Description()
        {
            return $"Trim log data - {LogObject.Description()} StartIndex: {StartIndex}; EndIndex: {EndIndex};";
        }
    }
}
