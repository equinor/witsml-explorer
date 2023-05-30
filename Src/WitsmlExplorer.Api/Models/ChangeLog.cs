namespace WitsmlExplorer.Api.Models
{
    // ChangeLog extends ObjectOnWellbore despite not having uid and name fields in WITSML
    // These fields are set in the API to conform to ObjectOnWellbore
    public class ChangeLog : ObjectOnWellbore
    {
        public string UidObject { get; init; }
        public string NameObject { get; init; }
        public string LastChangeType { get; init; }
        public CommonData CommonData { get; init; }
    }
}
