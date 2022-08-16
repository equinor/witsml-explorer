namespace WitsmlExplorer.Api.Jobs.Common
{
    public class WellReference : IReference
    {
        public string WellUid { get; set; }

        public string Description()
        {
            return $"WellUid: {WellUid}; ";
        }
    }
}
