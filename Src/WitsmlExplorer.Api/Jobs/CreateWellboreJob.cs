using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWellboreJob
    {
        public Wellbore Wellbore { get; init; }
    }
}
