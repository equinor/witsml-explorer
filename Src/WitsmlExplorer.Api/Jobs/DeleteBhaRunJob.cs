using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteBhaRunJob
    {
        public BhaRunReferences BhaRunReferences { get; init; }
    }
}
