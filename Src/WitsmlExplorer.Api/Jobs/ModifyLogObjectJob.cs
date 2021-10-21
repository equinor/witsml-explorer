using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyLogObjectJob
    {
        public LogObject LogObject { get; init; }
    }
}
