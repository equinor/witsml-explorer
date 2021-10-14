using WitsmlExplorer.Api.Jobs.Common;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteLogObjectsJob
    {
        public IEnumerable<LogReference> LogReferences { get; init; }
    }
}
