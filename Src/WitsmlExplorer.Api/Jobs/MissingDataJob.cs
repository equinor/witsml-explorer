using System.Collections.Generic;
using System.Linq;

using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record MissingDataJob : Job
    {
        public ICollection<WellReference> WellReferences { get; init; }
        public ICollection<WellboreReference> WellboreReferences { get; init; }
        public ICollection<MissingDataCheck> MissingDataChecks { get; init; }

        public override string Description()
        {
            return $"Missing Data Agent"
                + $" - WellUids: {GetWellUid()};"
                + $" WellboreUids: {string.Join(", ", WellboreReferences.Select(w => w.WellboreUid))}";
        }

        public override string GetObjectName()
        {
            return null;
        }

        public override string GetWellboreName()
        {
            return WellboreReferences.IsNullOrEmpty() ? null : string.Join(", ", WellboreReferences.Select(w => w.WellboreName));
        }

        public override string GetWellName()
        {
            var wellNames = new List<string>();

            if (!WellboreReferences.IsNullOrEmpty())
            {
                wellNames.AddRange(WellboreReferences.Select(w => w.WellName).Distinct());
            }

            if (!WellReferences.IsNullOrEmpty())
            {
                wellNames.AddRange(WellReferences.Select(w => w.WellName).Distinct());
            }

            return string.Join(", ", wellNames.Distinct());
        }

        private string GetWellUid()
        {
            var wellUids = new List<string>();

            if (!WellboreReferences.IsNullOrEmpty())
            {
                wellUids.AddRange(WellboreReferences.Select(w => w.WellUid).Distinct());
            }

            if (!WellReferences.IsNullOrEmpty())
            {
                wellUids.AddRange(WellReferences.Select(w => w.WellUid).Distinct());
            }

            return string.Join(", ", wellUids.Distinct());
        }
    }
}
