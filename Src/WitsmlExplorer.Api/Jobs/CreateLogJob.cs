using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateLogJob : IJob
    {
        public LogObject LogObject { get; init; }

        public override string Description()
        {
            return $"Create Log - WellUid: {LogObject.WellUid}; WellboreUid: {LogObject.WellboreUid}; LogUid: {LogObject.Uid};";
        }
    }
}
