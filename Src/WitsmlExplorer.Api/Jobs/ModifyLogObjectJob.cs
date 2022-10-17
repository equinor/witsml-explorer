using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyLogObjectJob : Job
    {
        public LogObject LogObject { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {LogObject.WellUid}; WellboreUid: {LogObject.WellboreUid}; LogUid: {LogObject.Uid};";
        }

        public override string GetObjectName()
        {
            return LogObject.Name;
        }

        public override string GetWellboreName()
        {
            return LogObject.WellboreName;
        }

        public override string GetWellName()
        {
            return LogObject.WellName;
        }
    }
}
