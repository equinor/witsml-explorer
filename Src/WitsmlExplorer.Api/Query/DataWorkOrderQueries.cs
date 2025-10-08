using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;
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
                // Field = "",
                DataProvider = "",
                DataConsumer = "",
                DTimPlannedStart = "",
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
                DataSourceConfigurationSets = new List<WitsmlDataSourceConfigurationSet>()
                {
                    new WitsmlDataSourceConfigurationSet()
                    {
                        Uid = "",
                        DataSourceConfigurations =
                        [
                            new WitsmlDataSourceConfiguration()
                            {
                                Name = "",
                                Description = "",
                                NominalHoleSize = new WitsmlLengthMeasure(),
                                Tubular = new WitsmlRefNameString(),
                                Status = "",
                                TimeStatus = "",
                                DepthStatus = "",
                                DTimPlannedStart = "",
                                DTimPlannedStop = "",
                                MDPlannedStart = new WitsmlLengthMeasure(),
                                MDPlannedStop = new WitsmlLengthMeasure(),
                                DTimChangeDeadline = "",
                                VersionNumber = 0,
                                ChangeReason =
                                    new WitsmlConfigurationChangeReason()
                                    {
                                        ChangedBy = "",
                                        DTimChanged = "",
                                        IsChangedDataRequirements = false,
                                        Comments = "",
                                        ChannelsModified = new List<string>(),
                                        ChannelsAdded = new List<string>(),
                                        ChannelsRemoved = new List<string>()
                                    },
                                ChannelConfigurations =
                                [
                                    new()
                                    {
                                        Uid = "",
                                        Mnemonic = "",
                                        Uom = "",
                                        GlobalMnemonic = "",
                                        IndexType = "",
                                        ToolName = "",
                                        Service = "",
                                        SensorOffset =
                                            new WitsmlLengthMeasure(),
                                        Criticality = "",
                                        LogName = "",
                                        Description = "",
                                        Comments = "",
                                        Requirements =
                                        [
                                            new()
                                            {
                                                Uid = "",
                                                Purpose = "",
                                                MinInterval =
                                                    new WitsmlTimeMeasure(),
                                                MaxInterval =
                                                    new WitsmlTimeMeasure(),
                                                MinPrecision =
                                                    new Measure(),
                                                MaxPrecision =
                                                    new Measure(),
                                                MinValue = new Measure(),
                                                MaxValue = new Measure(),
                                                MinStep =
                                                    new
                                                        WitsmlLengthMeasure(),
                                                MaxStep =
                                                    new
                                                        WitsmlLengthMeasure(),
                                                MinDelta = new Measure(),
                                                MaxDelta = new Measure(),
                                                Latency =
                                                    new WitsmlTimeMeasure(),
                                                MdThreshold =
                                                    new
                                                        WitsmlLengthMeasure(),
                                                DynamicMdThreshold = false,
                                                Comments = ""
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
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
