using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TrajectoryReferences : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string[] TrajectoryUids { get; set; }

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"TrajectoryUids: {string.Join(", ", TrajectoryUids)}; ");
            return desc.ToString();
        }
    }
}
