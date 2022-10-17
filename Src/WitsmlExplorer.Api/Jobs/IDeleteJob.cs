using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record IDeleteJob<T> : Job where T : IReference
    {
        public T ToDelete { get; init; }

        public override string Description()
        {
            return $"ToDelete - {ToDelete.Description()}";
        }

        public override string GetObjectName()
        {
            return ToDelete.GetObjectName();
        }

        public override string GetWellboreName()
        {
            return ToDelete.GetWellboreName();
        }

        public override string GetWellName()
        {
            return ToDelete.GetWellName();
        }
    }
}
