using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogReference
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string LogUid { get; set; }
        public IEnumerable<string> CheckedLogUids { get; set; } = new List<string>();
    }
}
