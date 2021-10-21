using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteMnemonicsJob
    {
        public LogReference LogObject { get; init; }
        public IEnumerable<string> Mnemonics { get; init; }
    }
}
