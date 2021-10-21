using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteMudLogJob
    {
        public MudLogReference MudLogReference { get; init; }
    }
}
