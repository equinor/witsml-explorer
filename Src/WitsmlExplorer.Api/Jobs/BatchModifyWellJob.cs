using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record BatchModifyWellJob : Job
    {
        public IEnumerable<Well> Wells { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUids: {string.Join(", ", Wells.Select(well => well.Uid))}";
        }
    }
}
