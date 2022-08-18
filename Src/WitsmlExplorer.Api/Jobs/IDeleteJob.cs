using System.Text;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record IDeleteJob<T> : IJob where T : IReference
    {
        public T ToDelete { get; init; }

        public string Description()
        {
            return $"ToDelete: {ToDelete.Description()}";
        }

    }
}
