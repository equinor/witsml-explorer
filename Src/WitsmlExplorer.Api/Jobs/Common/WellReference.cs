namespace WitsmlExplorer.Api.Jobs.Common
{
    public class WellReference : IReference
    {
        public string WellUid { get; set; }
        public string WellName { get; set; }

        public string Description()
        {
            return $"WellUid: {WellUid}; ";
        }

        public string GetObjectName()
        {
            return null;
        }

        public string GetWellboreName()
        {
            return null;
        }

        public string GetWellName()
        {
            return WellName;
        }
    }
}
