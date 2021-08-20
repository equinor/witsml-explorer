using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogCurvesReference
    {
        public LogReference LogReference { get; set; }
        public IEnumerable<string> Mnemonics { get; set; } = new List<string>();
    }
}
