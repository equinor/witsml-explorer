using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class DeleteMnemonicsJob
    {
        public LogReference LogObject { get; set; }
        public string[] Mnemonics { get; set; }
    }
}
