using WitsmlExplorer.Api.Jobs.Common;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs
{
    public class DeleteLogObjectsJob
    {
        public IEnumerable<LogReference> LogReferences { get; set; }
    }
}
