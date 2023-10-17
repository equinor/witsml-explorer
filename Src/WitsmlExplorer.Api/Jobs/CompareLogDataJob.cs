using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CompareLogDataJob : Job
    {
        public LogObject SourceLog { get; init; }
        public LogObject TargetLog { get; init; }

        public override string Description()
        {
            return $"Compare Log Data - Log1: {SourceLog.Name} and Log2: {TargetLog.Name}";
        }
        public override string GetWellName()
        {
            return SourceLog.WellName;
        }
        public override string GetWellboreName()
        {
            return SourceLog.WellboreName;
        }
        public override string GetObjectName()
        {
            return SourceLog.Name;
        }
    }
}
