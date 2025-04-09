using System.Collections.Generic;
using System.Linq;

using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record MinimumDataQcJob : Job
    {
        public LogObject LogReference { get; init; }
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }
        public ICollection<string> Mnemonics { get; init; }
        public double? Density { get; init; }
        public double? DepthGap { get; init; }
        public long? TimeGap { get; init; }
        public override bool IsCancelable => true;

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
