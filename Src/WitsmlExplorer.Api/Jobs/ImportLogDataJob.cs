using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class ImportLogDataJob
    {
        public LogReference TargetLog { get; set; }
        public List<string> Mnemonics { get; set; }
        public List<string> Units { get; set; }
        public IEnumerable<IEnumerable<string>> DataRows { get; set; }
    }
}
