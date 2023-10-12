using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteEmptyMnemonicsJob : Job
    {

        public IEnumerable<WellReference> Wells { get; init; }
        public IEnumerable<WellboreReference> Wellbores { get; init; }
        public double NullDepthValue { get; init; }
        public DateTime NullTimeValue { get; init; }

        public DeleteEmptyMnemonicsJob()
        {
            Wells = new List<WellReference>();
            Wellbores = new List<WellboreReference>();
        }

        public override string Description()
        {
            return "DeleteEmptyMnemonicsJob"
                + $" - WellUids: {GetWellUid()};"
                + $" WellboreUids: {string.Join(", ", Wellbores.Select(w => w.WellboreUid))}";
        }

        public override string GetObjectName()
        {
            return null;
        }

        public override string GetWellboreName()
        {
            return Wellbores.IsNullOrEmpty() ? null : string.Join(", ", Wellbores.Select(w => w.WellboreName));
        }

        public override string GetWellName()
        {
            var wellNames = new List<string>();

            if (!Wellbores.IsNullOrEmpty())
            {
                wellNames.AddRange(Wellbores.Select(w => w.WellName).Distinct());
            }

            if (!Wells.IsNullOrEmpty())
            {
                wellNames.AddRange(Wells.Select(w => w.WellName).Distinct());
            }

            return string.Join(", ", wellNames.Distinct());
        }

        private string GetWellUid()
        {
            var wellUids = new List<string>();

            if (!Wellbores.IsNullOrEmpty())
            {
                wellUids.AddRange(Wellbores.Select(w => w.WellUid).Distinct());
            }

            if (!Wells.IsNullOrEmpty())
            {
                wellUids.AddRange(Wells.Select(w => w.WellUid).Distinct());
            }

            return string.Join(", ", wellUids.Distinct());
        }
    }
}
