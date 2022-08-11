using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class MessageObjectReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] MessageObjectUids { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"MessageObjectUids: {string.Join(", ", MessageObjectUids)}; ");
            return desc.ToString();
        }
    }
}
