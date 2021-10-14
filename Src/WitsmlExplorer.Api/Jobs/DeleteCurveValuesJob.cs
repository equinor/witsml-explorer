using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteCurveValuesJob
    {
        public LogReference LogReference { get; init; }
        public IEnumerable<string> Mnemonics { get; init; }
        public IEnumerable<IndexRange> IndexRanges { get; init; }
    }

    public record IndexRange {

        public string StartIndex { get; init; }
        public string EndIndex { get; init; }
    }
}
