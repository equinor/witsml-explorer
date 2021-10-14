using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record ImportLogDataJob
    {
        public LogReference TargetLog { get; init; }
        public IEnumerable<string> Mnemonics { get; init; }
        public IEnumerable<string> Units { get; init; }
        public IEnumerable<IEnumerable<string>> DataRows { get; init; }
    }
}
