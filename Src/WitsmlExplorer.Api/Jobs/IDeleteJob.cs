using System.Text;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record IDeleteJob<T> : IJob where T : IReference
    {
        public T Source { get; init; }

        public string Description()
        {
            return $"\t\nSource: {Source.Description()}";
        }

    }
}
