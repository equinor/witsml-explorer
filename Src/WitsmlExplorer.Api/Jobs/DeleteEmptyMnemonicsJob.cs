using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteEmptyMnemonicsJob : Job
    {
        public ICollection<WellReference> Wells { get; init; } = new List<WellReference>();
        public ICollection<WellboreReference> Wellbores { get; init; } = new List<WellboreReference>();
        public ICollection<ObjectReference> Logs { get; init; } = new List<ObjectReference>();
        public double NullDepthValue { get; init; }
        public DateTime NullTimeValue { get; init; }
        public bool DeleteNullIndex { get; init; }

        public override string Description()
        {
            return "DeleteEmptyMnemonicsJob"
                + $" - WellUids: {GetWellUid()};"
                + $" WellboreUids: {GetWellboreUid()};"
                + $" LogUids: {GetObjectUid()};";
        }

        public override string GetObjectName()
        {
            var logNames = Logs.Select(l => l.Name).Distinct();
            return string.Join(", ", logNames);
        }

        public override string GetWellboreName()
        {
            var wellboreNames = new List<string>();

            if (!Logs.IsNullOrEmpty())
            {
                wellboreNames.AddRange(Logs.Select(w => w.WellboreName).Distinct());
            }

            if (!Wellbores.IsNullOrEmpty())
            {
                wellboreNames.AddRange(Wellbores.Select(w => w.WellboreName).Distinct());
            }

            return string.Join(", ", wellboreNames.Distinct());
        }

        public override string GetWellName()
        {
            var wellNames = new List<string>();

            if (!Logs.IsNullOrEmpty())
            {
                wellNames.AddRange(Logs.Select(w => w.WellName).Distinct());
            }

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

            if (!Logs.IsNullOrEmpty())
            {
                wellUids.AddRange(Logs.Select(w => w.WellUid).Distinct());
            }

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

        private string GetWellboreUid()
        {
            var wellboreUids = new List<string>();

            if (!Logs.IsNullOrEmpty())
            {
                wellboreUids.AddRange(Logs.Select(w => w.WellboreUid).Distinct());
            }

            if (!Wellbores.IsNullOrEmpty())
            {
                wellboreUids.AddRange(Wellbores.Select(w => w.WellboreUid).Distinct());
            }

            return string.Join(", ", wellboreUids.Distinct());
        }

        private string GetObjectUid()
        {
            var logUids = Logs.Select(l => l.Uid).Distinct();
            return string.Join(", ", logUids);
        }
    }
}
