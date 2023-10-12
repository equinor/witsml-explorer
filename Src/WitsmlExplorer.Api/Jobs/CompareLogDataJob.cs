using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CompareLogDataJob : Job
    {
        public LogObject LogReference { get; init; }
        public LogObject SelectedLog { get; init; }
        public LogObject TargetLog { get; init; }

        public override string Description()
        {
            return $"Compare Log Data - Log: {LogReference.Name}";
        }
        public override string GetWellName()
        {
            return LogReference.WellName;
        }
        public override string GetWellboreName()
        {
            return LogReference.WellboreName;
        }
        public override string GetObjectName()
        {
            return LogReference.Name;
        }
    }
}
