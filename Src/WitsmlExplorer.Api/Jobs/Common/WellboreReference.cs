using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class WellboreReference : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            return desc.ToString();
        }
    }
}
