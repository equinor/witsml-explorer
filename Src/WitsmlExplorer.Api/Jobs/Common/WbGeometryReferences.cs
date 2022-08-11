using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class WbGeometryReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] WbGeometryUids { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"WbGeometryUids: {string.Join(", ", WbGeometryUids)}; ");
            return desc.ToString();
        }
    }
}
