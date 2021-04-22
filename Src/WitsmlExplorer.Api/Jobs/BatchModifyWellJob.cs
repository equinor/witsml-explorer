using System.Collections.Generic;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public class BatchModifyWellJob
    {
        public IEnumerable<Well> Wells { get; set; }
    }
}
