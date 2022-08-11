using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class RigReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] RigUids { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"RigUids: {string.Join(", ", RigUids)}; ");
            return desc.ToString();
        }
    }
}
