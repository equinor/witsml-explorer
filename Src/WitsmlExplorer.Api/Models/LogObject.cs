namespace WitsmlExplorer.Api.Models
{
    public class LogObject : ObjectOnWellbore
    {
        public string IndexType { get; set; }
        public string StartIndex { get; set; }
        public string EndIndex { get; set; }
        public bool ObjectGrowing { get; init; }
        public string ServiceCompany { get; init; }
        public string RunNumber { get; init; }
        public string IndexCurve { get; init; }
        public int Mnemonics { get; init; }
        public CommonData CommonData { get; init; }
    }
}
