using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public class RenameMnemonicJob
    {
        public LogReference LogReference { get; set; }
        public string Mnemonic { get; set; }
        public string NewMnemonic { get; set; }
    }
}
