using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTubularJob : IJob
    {
        public Tubular Tubular { get; init; }

        public string Description()
        {
            return $"ToModify - WellUid: {Tubular.WellUid}; WellboreUid: {Tubular.WellboreUid}; TubularUid: {Tubular.Uid};";
        }
    }
}
