using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogReferences : IReference
    {
        public string ServerUrl { get; set; }
        public IEnumerable<LogReference> LogReferenceList { get; set; } = new List<LogReference>();

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"ServerUrl: {ServerUrl} ");
            LogReferenceList.ToList().ForEach(logReference => desc.Append(logReference.Description()));
            return desc.ToString();
        }
    }
}
