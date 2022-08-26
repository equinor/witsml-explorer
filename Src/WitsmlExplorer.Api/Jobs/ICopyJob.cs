using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record ICopyJob<T, U> : Job where T : IReference where U : IReference
    {
        public T Source { get; init; }
        public U Target { get; init; }

        public override string Description()
        {
            return $"Source - {Source.Description()}\t\nTarget - {Target.Description()}";
        }

    }
}
