using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyBhaRunJob
    {
        public BhaRun BhaRun { get; init; }
    }
}
