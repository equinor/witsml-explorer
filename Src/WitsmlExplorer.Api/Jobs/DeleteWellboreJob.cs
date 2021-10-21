using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteWellboreJob
    {
        public WellboreReference WellboreReference { get; init; }
    }
}
