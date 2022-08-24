using System.Text;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record IDeleteJob<T> : Job where T : IReference
    {
        public T ToDelete { get; init; }

        public override string Description()
        {
            return $"ToDelete: {ToDelete.Description()}";
        }

    }
}
