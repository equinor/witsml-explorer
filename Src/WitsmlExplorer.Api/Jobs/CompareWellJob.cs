using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    /// <summary>
    /// Job for comparing 2 wells.
    /// </summary>
    public record CompareWellJob : Job
    {
        public WellReference SourceWell { get; init; }
        public WellReference TargetWell { get; init; }
        public bool CompareWellboreObjects { get; init; } = false;
        public bool DeepCompareObjects { get; init; } = true;
        public bool MatchByNameIfUidDiffers { get; init; } = false;
        public bool OmitCustomData { get; init; } = true;
        public bool OmitTimestamps { get; init; } = true;
        public DecimalComparisonMode DecimalMode { get; init; } = DecimalComparisonMode.ServerSettings;
        public int? CustomDecimalPlaces { get; init; }
        public TimezoneComparisonMode TimezoneMode { get; init; } = TimezoneComparisonMode.Utc;
        public string Timezone { get; init; }
        public bool ReportAllMismatches { get; init; } = true;
        public int? MaxMismatches { get; init; }

        protected override bool IsCancelable => true;

        public override string Description()
        {
            return $"Comparing 2 wells - SourceWellUid: {SourceWell?.WellUid}; TargetWellUid: {TargetWell?.WellUid};";
        }

        public override string GetObjectName()
        {
            return null;
        }

        public override string GetWellboreName()
        {
            return null;
        }

        public override string GetWellName()
        {
            return $"Source={SourceWell?.WellName} Target={TargetWell?.WellName}";
        }
    }
}
