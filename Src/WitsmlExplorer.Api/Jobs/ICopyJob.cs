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
            // Return Source.GetObjectName() when Target.GetObjectName() is null to
            // use the name of the object to be copied when the target is a wellbore
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
