using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query;

public static class DataWorkOrderQueries
{
    public static WitsmlDataWorkOrders GetShortWitsmlDataWorkOrder(string wellUid, string wellboreUid, string dwoUid = "")
    {
        return new WitsmlDataWorkOrders
        {
            DataWorkOrders = new WitsmlDataWorkOrder()
            {
                Uid = dwoUid,
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                NameWell = "",
                NameWellbore = "",
                Name = "",
                DwoVersion = "",
                Field = "",
                DataProvider = "",
                DataConsumer = "",
                Description = "",
                DTimPlannedStart = "",
                DTimPlannedStop = "",
                AssetContacts =
                [
                    new()
                    {
                        Uid = "",
                        CompanyName = "",
                        Name = "",
                        Role = "",
                        EmailAddress = "",
                        PhoneNum = "",
                        Availability = "",
                        TimeZone = "",
                    }
                ],
                DataSourceConfigurationSets =
                [
                    new()
                    {
                        Uid = ""
                    }
                ],
                CommonData = new WitsmlCommonData()
                {
                    ItemState = "",
                    SourceName = "",
                    DTimLastChange = "",
                    DTimCreation = "",
                    ServiceCategory = "",
                    Comments = "",
                    DefaultDatum = "",
                }
            }.AsItemInList()
        };
    }

    public static WitsmlDataWorkOrders QueryById(string wellUid, string wellboreUid, string dwoUid)
    {
        return new WitsmlDataWorkOrders()
        {
            DataWorkOrders = new WitsmlDataWorkOrder()
            {
                Uid = dwoUid,
                UidWell = wellUid,
                UidWellbore = wellboreUid
            }.AsItemInList()
        };
    }
}
