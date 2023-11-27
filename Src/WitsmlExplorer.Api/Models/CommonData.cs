using Witsml.Data;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class CommonData
    {
        public string SourceName { get; init; }
        public string DTimCreation { get; init; }
        public string DTimLastChange { get; init; }
        public string ItemState { get; init; }
        public string ServiceCategory { get; init; }
        public string Comments { get; init; }
        public string AcquisitionTimeZone { get; init; }
        public string DefaultDatum { get; init; }
    }

    public static class CommonDataExtensions
    {
        public static WitsmlCommonData ToWitsml(this CommonData commonData)
        {
            return new WitsmlCommonData
            {
                SourceName = commonData.SourceName,
                DTimCreation = StringHelpers.ToUniversalDateTimeString(commonData.DTimCreation),
                DTimLastChange = StringHelpers.ToUniversalDateTimeString(commonData.DTimLastChange),
                ItemState = commonData.ItemState,
                ServiceCategory = commonData.ServiceCategory,
                Comments = commonData.Comments,
                AcquisitionTimeZone = commonData.AcquisitionTimeZone,
                DefaultDatum = commonData.DefaultDatum
            };
        }
    }
}
