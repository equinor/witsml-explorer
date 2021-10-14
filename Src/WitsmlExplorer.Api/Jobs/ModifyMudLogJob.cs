using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyMudLogJob
    {
        public MudLog MudLog { get; init; }
    }
}
