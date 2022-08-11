using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TrajectoryReference : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string TrajectoryUid { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"TrajectoryrUid: {TrajectoryUid}; ");
            return desc.ToString();
        }
    }
}
