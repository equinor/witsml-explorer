using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record MissingDataJob : Job
    {
        public IEnumerable<WellReference> WellReferences { get; init; }
        public IEnumerable<WellboreReference> WellboreReferences { get; init; }
        public IEnumerable<MissingDataCheck> MissingDataChecks { get; init; }

        public override string Description()
        {
            return $"Missing Data Agent";
        }

        public override string GetObjectName()
        {
            return "";
        }

        public override string GetWellboreName()
        {
            return "";
        }

        public override string GetWellName()
        {
            return "";
        }
    }
}
