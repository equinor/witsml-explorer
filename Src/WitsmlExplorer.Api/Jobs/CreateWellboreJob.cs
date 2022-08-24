using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWellboreJob : Job
    {
        public Wellbore Wellbore { get; init; }

        public override string Description()
        {
            return $"Create Wellbore - WellUid: {Wellbore.WellUid}; WellboreUid: {Wellbore.Uid};";
        }
    }
}
