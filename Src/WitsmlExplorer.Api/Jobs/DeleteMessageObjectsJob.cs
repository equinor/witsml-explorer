using System.Collections.Generic;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public class DeleteMessageObjectsJob
    {
        public IEnumerable<MessageObjectReference> MessageObjects { get; set; }
    }
}
