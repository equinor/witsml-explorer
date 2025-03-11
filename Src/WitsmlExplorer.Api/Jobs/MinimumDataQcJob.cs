using System.Collections.Generic;
using System.Linq;

using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record MinimumDataQcJob : Job
    {
        public LogObject LogReference { get; init; }
        public ICollection<string> Mnemonics { get; init; }
        public double? Density { get; set; }
        public double? DepthGap { get; set; }
        public long? TimeGap { get; set; }

        public override string Description()
        {
            return $"Minimum Data QC"
                + $" - Uid: {LogReference.Uid};"
                + $" WellUid: {LogReference.WellUid};"
                + $" WellboreUid: {LogReference.WellboreUid};";
        }

        public override string GetObjectName()
        {
            return LogReference.Name;
        }

        public override string GetWellboreName()
        {
            return LogReference.WellboreName;
        }

        public override string GetWellName()
        {
            return LogReference.WellName;
        }
    }
}
