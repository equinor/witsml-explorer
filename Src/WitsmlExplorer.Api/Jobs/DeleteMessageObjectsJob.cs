using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteMessageObjectsJob
    {
        public IEnumerable<MessageObjectReference> MessageObjects { get; init; }
    }
}
