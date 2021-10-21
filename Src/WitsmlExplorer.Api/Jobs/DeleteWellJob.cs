using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteWellJob
    {
        public WellReference WellReference { get; init; }
    }
}
