using System.Text;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record ICopyJob<T, U> : IJob where T : IReference where U : IReference
    {
        public T Source { get; init; }
        public U Target { get; init; }

        public string Description()
        {
            var jobDesc = new StringBuilder();
            jobDesc.Append($"\t\nSource: {Source.Description()}");
            jobDesc.Append($"\t\nTarget: {Target.Description()}");
            return jobDesc.ToString();
        }

    }
}
