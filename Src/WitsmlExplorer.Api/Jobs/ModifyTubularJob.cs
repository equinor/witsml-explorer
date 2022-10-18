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

        public override string GetObjectName()
        {
            return Tubular.Name;
        }

        public override string GetWellboreName()
        {
            return Tubular.WellboreName;
        }

        public override string GetWellName()
        {
            return Tubular.WellName;
        }
    }
}
