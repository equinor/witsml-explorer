using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class CopyLogJob
    {
        public LogReferences Source { get; set; }
        public WellboreReference Target { get; set; }
    }
}
