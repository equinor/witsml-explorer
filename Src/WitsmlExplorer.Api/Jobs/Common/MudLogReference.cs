using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class MudLogReference : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string Uid { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"MudLogUid: {Uid}; ");
            return desc.ToString();
        }
    }
}
