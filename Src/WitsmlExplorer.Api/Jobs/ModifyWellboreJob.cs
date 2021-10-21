using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWellboreJob
    {
        public Wellbore Wellbore { get; init; }
    }
}
