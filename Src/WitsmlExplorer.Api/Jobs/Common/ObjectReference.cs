using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class ObjectReference : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string Uid { get; set; }

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"Uid: {Uid}; ");
            return desc.ToString();
        }
    }
}
