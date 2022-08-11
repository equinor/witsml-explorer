using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TubularReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] TubularUids { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"TubularUids: {string.Join(", ", TubularUids)}; ");
            return desc.ToString();
        }
    }
}
