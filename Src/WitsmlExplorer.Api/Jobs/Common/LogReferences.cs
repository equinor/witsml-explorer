using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogReferences
    {
        public string ServerUrl { get; set; }
        public IEnumerable<LogReference> LogReferenceList { get; set; } = new List<LogReference>();
    }
}
