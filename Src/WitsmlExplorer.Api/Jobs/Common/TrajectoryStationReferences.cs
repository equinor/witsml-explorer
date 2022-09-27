using System.Collections.Generic;
using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TrajectoryStationReferences : IReference
    {
        public ObjectReference TrajectoryReference { get; set; }
        public IEnumerable<string> TrajectoryStationUids { get; set; } = new List<string>();

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"{TrajectoryReference.Description()}");
            desc.Append($"TrajectoryStationUids: {string.Join(", ", TrajectoryStationUids)}; ");
            return desc.ToString();
        }
    }
}
