using Witsml.Data;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class CommonTime
    {
        public string DTimCreation { get; init; }
        public string DTimLastChange { get; init; }
    }

    public static class CommonTimeExtensions
    {
        public static WitsmlCommonTime ToWitsml(this CommonTime commonTime)
        {
            return new WitsmlCommonTime
            {
                DTimCreation = StringHelpers.ToUniversalDateTimeString(commonTime.DTimCreation),
                DTimLastChange = StringHelpers.ToUniversalDateTimeString(commonTime.DTimLastChange)
            };
        }
    }
}
