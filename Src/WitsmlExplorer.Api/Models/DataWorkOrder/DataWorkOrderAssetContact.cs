using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class DataWorkOrderAssetContact
{
    public string Uid { get; set; }

    public string CompanyName { get; set; }

    public string Name { get; set; }

    public string Role { get; set; }

    public string EmailAddress { get; set; }

    public string PhoneNum { get; set; }

    public string Availability { get; set; }

    public string TimeZone { get; set; }
}

public static class DataWorkOrderAssetContactExtensions
{
    public static WitsmlDataWorkOrderAssetContact ToWitsml(this DataWorkOrderAssetContact assetContact)
    {
        return new WitsmlDataWorkOrderAssetContact
        {
            Uid = assetContact.Uid,
            CompanyName = assetContact.CompanyName,
            Name = assetContact.Name,
            Role = assetContact.Role,
            EmailAddress = assetContact.EmailAddress,
            PhoneNum = assetContact.PhoneNum,
            Availability = assetContact.Availability,
            TimeZone = assetContact.TimeZone
        };
    }
}
