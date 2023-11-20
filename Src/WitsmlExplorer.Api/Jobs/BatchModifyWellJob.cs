using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record BatchModifyWellJob : Job
    {
        public ICollection<Well> Wells { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUids: {string.Join(", ", Wells.Select(well => well.Uid))}";
        }

        public override string GetObjectName()
        {
            return null;
        }

        public override string GetWellboreName()
        {
            return null;
        }

        public override string GetWellName()
        {
            return string.Join(", ", Wells.Select(well => well.Name));
        }
    }
}
