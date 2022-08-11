using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TubularReference : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string TubularUid { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"TubularUid: {TubularUid}; ");
            return desc.ToString();
        }

    }
}
