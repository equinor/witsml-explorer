using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class TrimLogDataJob
    {
        public LogReference LogObject { get; set; }

        public string StartIndex { get; set; }

        public string EndIndex { get; set; }
    }
}
