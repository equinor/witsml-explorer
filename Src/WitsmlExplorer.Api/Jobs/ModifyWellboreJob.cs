using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWellboreJob : IJob
    {
        public Wellbore Wellbore { get; init; }

        public string Description()
        {
            return $"ToModify - WellUid: {Wellbore.WellUid}; WellboreUid: {Wellbore.Uid};";
        }
    }
}
