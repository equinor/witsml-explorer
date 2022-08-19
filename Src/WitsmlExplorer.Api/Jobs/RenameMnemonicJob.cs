using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record RenameMnemonicJob : Job
    {
        public LogReference LogReference { get; init; }
        public string Mnemonic { get; init; }
        public string NewMnemonic { get; init; }

        public override string Description()
        {
            return $"Rename mnemonic - in Log: {LogReference.Description()} from mnemonic: {Mnemonic}; to mnemonic {NewMnemonic};";
        }
    }
}
