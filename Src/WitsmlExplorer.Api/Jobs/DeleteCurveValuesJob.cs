using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class DeleteCurveValuesJob
    {
        public LogReference LogReference { get; set; }
        public List<string> Mnemonics { get; set; }
        public IEnumerable<IndexRange> IndexRanges { get; set; }
    }

    public class IndexRange {

        public string StartIndex { get; set; }
        public string EndIndex { get; set; }
    }
}
