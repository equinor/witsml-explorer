using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyLogObjectJob : IJob
    {
        public LogObject LogObject { get; init; }

        public string Description()
        {
            return $"ToModify - WellUid: {LogObject.WellUid}; WellboreUid: {LogObject.WellboreUid}; LogUid: {LogObject.Uid};";
        }
    }
}
