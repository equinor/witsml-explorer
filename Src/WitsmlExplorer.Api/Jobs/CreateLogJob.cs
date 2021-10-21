using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateLogJob
    {
        public LogObject LogObject { get; init; }
    }
}
