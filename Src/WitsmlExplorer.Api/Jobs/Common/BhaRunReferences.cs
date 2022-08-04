using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class BhaRunReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] BhaRunUids { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"TubularUids: {string.Join(", ", BhaRunUids)}; ");
            return desc.ToString();
        }
    }
}
