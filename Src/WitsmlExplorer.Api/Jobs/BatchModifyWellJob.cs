using System.Collections.Generic;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record BatchModifyWellJob
    {
        public IEnumerable<Well> Wells { get; init; }
    }
}
