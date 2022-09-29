namespace WitsmlExplorer.Api.Models
{
    public abstract class ObjectOnWellbore
    {
        public string Uid { get; set; }
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string Name { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
    }
}
