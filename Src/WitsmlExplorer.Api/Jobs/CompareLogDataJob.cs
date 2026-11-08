using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CompareLogDataJob : Job
    {
        public ObjectReference SourceLog { get; init; }
        public ObjectReference TargetLog { get; init; }
        public bool IncludeIndexDuplicates { get; init; }
        public bool CompareAllIndexes { get; init; }
        public bool ReportAllMismatches { get; init; }
        public int? CustomDecimalPlaces { get; init; }
        public DecimalComparisonMode? DecimalMode { get; init; }
        public System.Collections.Generic.List<string> Mnemonics { get; init; }
        public double? SamplingInterval { get; init; }
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }

        public override string Description()
        {
            return $"Compare Log Data - Log1: {SourceLog.Name} and Log2: {TargetLog.Name}";
        }
        public override string GetWellName()
        {
            return $"Source={SourceLog.WellName} Target={TargetLog.WellName}";
        }
        public override string GetWellboreName()
        {
            return $"Source={SourceLog.WellboreName} Target={TargetLog.WellboreName}";
        }
        public override string GetObjectName()
        {
            return $"Source={SourceLog.Name} Target={TargetLog.Name}";
        }

        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        protected override bool IsCancelable => true;
    }
}
