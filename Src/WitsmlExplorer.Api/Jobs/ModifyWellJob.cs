using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWellJob
    {
        public Well Well { get; init; }
    }
}
