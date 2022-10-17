using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record ICopyJob<T, U> : Job where T : IReference where U : IReference
    {
        public T Source { get; init; }
        public U Target { get; init; }

        public override string Description()
        {
            return $"ToCopy - Source - {Source.Description()}\t\nTarget - {Target.Description()}";
        }

        public override string GetObjectName()
        {
            return Target.GetObjectName() ?? Source.GetObjectName();
        }

        public override string GetWellboreName()
        {
            return Target.GetWellboreName();
        }

        public override string GetWellName()
        {
            return Target.GetWellName();
        }

    }
}
