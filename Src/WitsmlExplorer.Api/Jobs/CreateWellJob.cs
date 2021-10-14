using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWellJob
    {
        public Well Well { get; init; }
    }
}
