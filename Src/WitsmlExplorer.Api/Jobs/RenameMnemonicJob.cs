using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record RenameMnemonicJob
    {
        public LogReference LogReference { get; init; }
        public string Mnemonic { get; init; }
        public string NewMnemonic { get; init; }
    }
}
