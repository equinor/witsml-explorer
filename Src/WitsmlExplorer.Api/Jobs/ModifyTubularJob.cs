using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTubularJob : Job
    {
        public Tubular Tubular { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {Tubular.WellUid}; WellboreUid: {Tubular.WellboreUid}; TubularUid: {Tubular.Uid};";
        }
    }
}
