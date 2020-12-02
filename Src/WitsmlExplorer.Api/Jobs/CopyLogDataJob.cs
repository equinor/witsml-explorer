using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class CopyLogDataJob
    {
        public LogCurvesReference LogCurvesReference { get; set; }
        public LogReference Target { get; set; }
    }

    public class LogCurvesReference
    {
        public LogReference LogReference { get; set; }
        public IEnumerable<string> Mnemonics { get; set; } = new List<string>();
    }
}
