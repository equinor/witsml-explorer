using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record TrimLogDataJob : Job
    {
        public LogReference LogObject { get; init; }

        public string StartIndex { get; init; }

        public string EndIndex { get; init; }

        public override string Description()
        {
            return $"Trim log data - {LogObject.Description()} StartIndex: {StartIndex}; EndIndex: {EndIndex};";
        }
    }
}
