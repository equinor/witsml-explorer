using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CompareLogDataJob : Job
    {
        public LogObject SelectedLog { get; init; }
        public LogObject TargetLog { get; init; }

        public override string Description()
        {
            return $"Compare Log Data - Log1: {SelectedLog.Name} and Log2: {TargetLog.Name}";
        }
        public override string GetWellName()
        {
            return SelectedLog.WellName;
        }
        public override string GetWellboreName()
        {
            return SelectedLog.WellboreName;
        }
        public override string GetObjectName()
        {
            return SelectedLog.Name;
        }
    }
}
