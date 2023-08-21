using System;
using System.Collections.Generic;
using System.Linq;

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
                + $" - WellUids: {string.Join(", ", Wells.Select(w => w.WellUid))};"
                + $" WellboreUids: {string.Join(", ", Wellbores.Select(w => w.WellboreUid))}";
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
            return null;
        }
    }
}
