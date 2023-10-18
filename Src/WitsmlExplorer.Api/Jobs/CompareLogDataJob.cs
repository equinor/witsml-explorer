using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CompareLogDataJob : Job
    {
        public ObjectReference SourceLog { get; init; }
        public ObjectReference TargetLog { get; init; }

        public override string Description()
        {
            return $"Compare Log Data - Log1: {SourceLog.Name} and Log2: {TargetLog.Name}";
        }
        public override string GetWellName()
        {
            return $"SourceLog.WellName={SourceLog.WellName} TargetLog.WellName={TargetLog.WellName}";
        }
        public override string GetWellboreName()
        {
            return $"SourceLog.WellboreName={SourceLog.WellboreName} TargetLog.WellboreName={TargetLog.WellboreName}";
        }
        public override string GetObjectName()
        {
            return $"SourceLog.Name={SourceLog.Name} TargetLog.Name={TargetLog.Name}";
        }
    }
}
