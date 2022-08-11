using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogReference : IReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string LogUid { get; set; }

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"WellUid: {WellUid}; ");
            desc.Append($"WellboreUid: {WellboreUid}; ");
            desc.Append($"LogUid: {LogUid}; ");
            return desc.ToString();
        }
    }
}
