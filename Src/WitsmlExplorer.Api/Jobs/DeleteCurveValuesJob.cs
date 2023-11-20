using System.Collections.Generic;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteCurveValuesJob : Job
    {
        public ObjectReference LogReference { get; init; }
        public ICollection<string> Mnemonics { get; init; }
        public ICollection<IndexRange> IndexRanges { get; init; }

        public override string Description()
        {
            return $"Delete curve values - {LogReference.Description()} Mnemonics: {string.Join(", ", Mnemonics)};";
        }

        public override string GetObjectName()
        {
            return LogReference.Name;
        }

        public override string GetWellboreName()
        {
            return LogReference.WellboreName;
        }

        public override string GetWellName()
        {
            return LogReference.WellName;
        }
    }

    public record IndexRange
    {
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }
    }
}
