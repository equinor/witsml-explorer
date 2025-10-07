using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query;

public static class DataWorkOrderQueries
{
    public static WitsmlDataWorkOrders GetWitsmlDataWorkOrder(string wellUid, string wellboreUid, string dwoUid = "")
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
                Description = "",
                Field = "",
                DataProvider = "",
                DataConsumer = "",
                DTimPlannedStart = "",
                AssetContacts = new List<WitsmlDataWorkOrderAssetContact>() { },
                DataSourceConfigurationSets = new List<WitsmlDataSourceConfigurationSet>() { },
                DwoVersion = "",
                DTimPlannedStop = "",
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
