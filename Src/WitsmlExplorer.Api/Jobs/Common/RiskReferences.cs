using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class RiskReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] RiskUids { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"RiskUids: {string.Join(", ", RiskUids)}; ");
            return desc.ToString();
        }
    }
}
