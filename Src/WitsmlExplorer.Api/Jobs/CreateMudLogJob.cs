using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateMudLogJob
    {
        public MudLog MudLog { get; init; }
    }
}
