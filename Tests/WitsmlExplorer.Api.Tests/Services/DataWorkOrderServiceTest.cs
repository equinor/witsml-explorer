using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class DataWorkdOrderServiceTests
    {
        private readonly DataWorkOrderService _service;
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public DataWorkdOrderServiceTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _service = new DataWorkOrderService(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task GetMessageObjects_AllRequiredElements_AllAccountedFor()
        {
            string uidWellbore = "a";
            string uidWell = "b";
            string nameWellbore = "c";
            string nameWell = "d";
            string uid = "e";
            string name = "f";
            string sourceName = "h";
            string dTimCreation = "2022-11-07T15:36:12.311+05:30";
            string dTimLastChange = "2022-11-07T17:36:12.311+05:30";
            string comments = "i";
            WitsmlDataWorkOrders workOrders = new()
            {
                DataWorkOrders = new WitsmlDataWorkOrder()
                {
                    UidWellbore = uidWellbore,
                    UidWell = uidWell,
                    NameWellbore = nameWellbore,
                    NameWell = nameWell,
                    Uid = uid,
                    Name = name,
                    DataProvider = "data provider",
                    DataConsumer = "data consumer",
                    Description = "description",
                    DTimPlannedStart = "2022-11-07T15:36:12.311+05:30",
                    DTimPlannedStop = "2022-11-08T15:36:12.311+05:30",
                    AssetContacts = GetAssetContacts(),
                    DataSourceConfigurationSets = GetDataSourceConfigrationSets(),
                    DwoVersion = "dwo version",
                    ExtensionNameValues = GetExtensionNameValues(),
                    CommonData = new WitsmlCommonData()
                    {
                        SourceName = sourceName,
                        DTimCreation = dTimCreation,
                        DTimLastChange = dTimLastChange,
                        Comments = comments
                    }
                }.AsItemInList()
            };
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlDataWorkOrders>(), It.Is<OptionsIn>(ops => ops.ReturnElements == ReturnElements.Requested), null))
                .Callback<WitsmlDataWorkOrders, OptionsIn, CancellationToken?>((_, _, _) => { })
                .ReturnsAsync(workOrders);

            IEnumerable<DataWorkOrder> result = await _service.GetDataWorkOrders("", "");
            DataWorkOrder workOrder = result.First();

            Assert.Equal(workOrder.WellboreUid, uidWellbore);
            Assert.Equal(workOrder.WellUid, uidWell);
            Assert.Equal(workOrder.WellboreName, nameWellbore);
            Assert.Equal(workOrder.WellName, nameWell);
            Assert.Equal(workOrder.Uid, uid);
            Assert.Equal(workOrder.Name, name);

            Assert.Equal(workOrder.CommonData.SourceName, sourceName);
            Assert.NotNull(workOrder.CommonData.DTimCreation);
            Assert.NotNull(workOrder.CommonData.DTimLastChange);
            Assert.Equal(workOrder.CommonData.Comments, comments);
        }

        private static List<WitsmlDataWorkOrderAssetContact> GetAssetContacts()
        {
            var result = new List<WitsmlDataWorkOrderAssetContact>()
            {
                new ()
                {
                    Uid = "uid",
                    CompanyName = "company name",
                    Name = "name",
                    Role = "role",
                    EmailAddress = "email",
                    PhoneNum = "phone",
                    Availability = "availability",
                    TimeZone = "time zone"
                }
            };
            return result;
        }

        private static List<WitsmlDataSourceConfigurationSet> GetDataSourceConfigrationSets()
        {
            var result = new List<WitsmlDataSourceConfigurationSet>()
            {
                new ()
                {
                    Uid = "uid",
                    DataSourceConfigurations = new List<WitsmlDataSourceConfiguration>()
                    {
                        new ()
                        {
                            Uid = "uid",
                            Name = "name",
                            DTimPlannedStart = "2022-11-07T15:36:12.311+05:30",
                            DTimPlannedStop = "2022-11-08T15:36:12.311+05:30",
                            NominalHoleSize = new WitsmlLengthMeasure()
                            {
                                Uom = "uom",
                                Value = "1.0"
                            },
                            Tubular = new WitsmlRefNameString()
                            {
                                UidRef = "uid ref",
                                Value = "value"
                            },
                            Status = "Approved",
                            TimeStatus = "Completed",
                            DepthStatus = "Active",
                            DTimChangeDeadline = "2022-11-08T15:36:12.311+05:30",
                            ChannelConfigurations = new List<WitsmlChannelConfiguration>()
                            {
                                new ()
                                {
                                    Uid = "uid",
                                    Mnemonic = "mnemonic",
                                    Uom = "uom",
                                    GlobalMnemonic = "global mnemonic",
                                    IndexType = "length",
                                    ToolName = "tool name",
                                    Service = "service",
                                    SensorOffset = new WitsmlLengthMeasure()
                                    {
                                        Uom = "uom",
                                        Value = "1.0"
                                    },
                                    Criticality = "High",
                                    LogName = "log name",
                                    Description = "description",
                                    Comments = "comments",
                                    Requirements = new List<WitsmlChannelRequirement>()
                                    {
                                        new()
                                        {
                                            Uid = "uid",
                                            Purpose = "Calibration",
                                            MinInterval = new WitsmlTimeMeasure()
                                            {
                                                Uom = "uom",
                                                Value = "1.0"
                                            },
                                            MaxInterval = new WitsmlTimeMeasure()
                                            {
                                                Uom = "uom",
                                                Value = "1.0"
                                            },
                                            MinPrecision = new Measure()
                                            {
                                                Uom = "uom",
                                                Value = "value"
                                            },
                                            MaxPrecision = new Measure()
                                            {
                                                Uom = "uom",
                                                Value = "value"
                                            },
                                            MinValue = new Measure()
                                            {
                                                Uom = "uom",
                                                Value = "value"
                                            },
                                            MaxValue = new Measure()
                                            {
                                                Uom = "uom",
                                                Value = "value"
                                            },
                                            MinStep = new WitsmlLengthMeasure()
                                            {
                                                Uom = "uom",
                                                Value = "1.0"
                                            },
                                            MaxStep = new WitsmlLengthMeasure()
                                            {
                                                Uom = "uom",
                                                Value = "1.0"
                                            },
                                            MinDelta = new Measure()
                                            {
                                                Uom = "uom",
                                                Value = "value"
                                            },
                                            MaxDelta = new Measure()
                                            {
                                                Uom = "uom",
                                                Value = "value"
                                            },
                                            Latency = new WitsmlTimeMeasure()
                                            {
                                                Uom = "uom",
                                                Value = "1.0"
                                            },
                                            MdThreshold = new WitsmlLengthMeasure()
                                            {
                                                Uom = "uom",
                                                Value = "1.0"
                                            },
                                            DynamicMdThreshold = true,
                                            Comments = "comments"
                                        }
                                    }
                                }
                            },
                            ChangeReason = new WitsmlConfigurationChangeReason()
                            {
                                Comments = "comments",
                                ChangedBy = "changed by",
                                ChannelsModified = new List<string>()
                                    {"a"},
                                ChannelsAdded = new List<string>()
                                    {"a"},
                                ChannelsRemoved = new List<string>()
                                    {"a"},
                                DTimChanged = "2022-11-08T15:36:12.311+05:30",
                                IsChangedDataRequirements = true
                            },
                            VersionNumber = 1
                        }
                    }
                }
            };
            return result;
        }

        private static List<WitsmlExtensionNameValue> GetExtensionNameValues()
        {
            var result = new List<WitsmlExtensionNameValue>()
            {
                new ()
                {
                    Uid = "uid",
                    Name = "name",
                    Value = new WitsmlExtensionValue()
                    {
                        Uom = "uom",
                        Value = "value"
                    }
                }
            };
            return result;
        }
    }

}
