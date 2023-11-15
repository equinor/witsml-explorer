namespace WitsmlExplorer.Api.Models.Reports
{
    public interface ICompareLogDataItem
    {
        string Mnemonic { get; set; }
        string SourceValue { get; set; }
        string TargetValue { get; set; }
    }

    public class CompareLogDataItem : ICompareLogDataItem
    {
        public string Mnemonic { get; set; }
        public string Index { get; set; }
        public string SourceValue { get; set; }
        public string TargetValue { get; set; }
    }

    public class CompareLogDataUnequalServerDecimalsItem : ICompareLogDataItem
    {
        public string Mnemonic { get; set; }
        public string SourceIndex { get; set; }
        public string TargetIndex { get; set; }
        public string SourceValue { get; set; }
        public string TargetValue { get; set; }
    }

    public class CompareLogDataUnequalServerDecimalsIndexDuplicateItem : ICompareLogDataItem
    {
        public string Mnemonic { get; set; }
        public string SourceIndex { get; set; }
        public string TargetIndex { get; set; }
        public string SourceValue { get; set; }
        public string TargetValue { get; set; }
        public string IndexDuplicate { get; set; }
    }
}
