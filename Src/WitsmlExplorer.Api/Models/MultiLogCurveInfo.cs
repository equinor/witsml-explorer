namespace WitsmlExplorer.Api.Models
{
    public class MultiLogCurveInfo : LogCurveInfo
    {
        public MultiLogCurveInfo()
        {

        }
        public string LogUid { get; init; }
        public string ServerUrl { get; init; }
    }
}
