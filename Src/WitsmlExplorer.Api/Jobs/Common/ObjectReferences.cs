using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class ObjectReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] ObjectUids { get; set; }

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"ObjectUids: {string.Join(", ", ObjectUids)}; ");
            return desc.ToString();
        }
    }
}
