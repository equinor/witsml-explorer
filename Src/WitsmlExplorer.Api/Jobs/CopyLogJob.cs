using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class CopyLogJob
    {
        public LogReference Source { get; set; }
        public WellboreReference Target { get; set; }
    }
}
