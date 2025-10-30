using System.Collections.Generic;
using System.Globalization;
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

using Measure = Witsml.Data.Measures.Measure;

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
            witsmlClientProvider.Setup(provider => provider.GetClient())
                .Returns(_witsmlClient.Object);
            _service = new DataWorkOrderService(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task GetDataWorkOrders_AllRequiredElements()
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
                    DwoVersion = "dwo version",
                    ExtensionNameValues = GetExtensionNameValues(),
                    CommonData = new WitsmlCommonData()
                    {
                        SourceName = sourceName,
                        DTimCreation = dTimCreation,
                        DTimLastChange = dTimLastChange,
                        Comments = comments,
                        ItemState = "model",
                        ServiceCategory = "a"
                    }
                }.AsItemInList()
            };
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlDataWorkOrders>(),
                        It.Is<OptionsIn>(ops =>
                            ops.ReturnElements == ReturnElements.Requested),
                        null))
                .Callback<WitsmlDataWorkOrders, OptionsIn, CancellationToken?>(
                    (_, _, _) => { })
                .ReturnsAsync(workOrders);

            IEnumerable<DataWorkOrder> result =
                await _service.GetDataWorkOrders("", "");
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

        [Fact]
        public async Task GetDataSourceConfigurationSets_AllRequiredElements()
        {
            const string uidSet = "f0000000-0000-0000-0000-000000000001";
            const string dscDepthStatus = "inactive";
            const string dscDescription = "initail run";
            const string dscName = "logging data";
            const string dscStatus = "submitted";
            const string dscTimeStatus = "inactive";
            var dscNominalHoleSize = new WitsmlLengthMeasure()
            {
                Uom = "in",
                Value = "8.5"
            };
            const string dscUid = "dc000000-0000-0000-0000-000000000001";
            const short dscVersionNumber = 1;
            const string channel1Criticality = "high";
            const string channel1Description = "Mud";
            const string channel1IndexType = "measured depth";
            const string channel1Mnemonic = "AAAAVG";
            const string channel1Service = "a";
            const string channel1ToolName = "b";
            const string channel1Uid =
                "f0000000-0000-0000-0000-000000000001";
            var requirement1MaxValue = new Measure()
            {
                Uom = "g/cm3",
                Value = "2.2"
            };
            var requirement1MinValue = new Measure()
            {
                Uom = "g/cm3",
                Value = "0.9"
            };
            const string requirement1Purpose = "display range";
            const string requirement1Uid = "d0000000-0000-0000-0000-000000000001";
            var requirement2MaxValue = new Measure()
            {
                Uom = "g/cm3",
                Value = "2.2"
            };
            var requirement2MinValue = new Measure()
            {
                Uom = "g/cm3",
                Value = "1.9"
            };
            const string requirement2Purpose = "display range";
            const string requirement2Uid = "d0000000-0000-0000-0000-000000000001";
            const string channel2Criticality = "normal";
            const string channel2Description = "Flow";
            const string channel2IndexType = "measured depth";
            const string channel2Mnemonic = "FFFAVG";
            const string channel2Service = "a";
            const string channel2ToolName = "b";
            const string channel2Uid =
                "f0000000-0000-0000-0000-000000000001";
            var workOrders = new WitsmlDataWorkOrders { DataWorkOrders = [] };
            var dataSourceConfigurationSets =
                new List<WitsmlDataSourceConfigurationSet>()
                {
                    new()
                    {
                        Uid = uidSet,
                        DataSourceConfigurations =
                        [
                            new()
                            {
                                DepthStatus = dscDepthStatus,
                                Description = dscDescription,
                                Name = dscName,
                                Status = dscStatus,
                                TimeStatus = dscTimeStatus,
                                Uid = dscUid,
                                VersionNumber = dscVersionNumber,
                                NominalHoleSize = dscNominalHoleSize,
                                ChannelConfigurations =
                                [
                                    new()
                                    {
                                        Criticality = channel1Criticality,
                                        Description = channel1Description,
                                        IndexType = channel1IndexType,
                                        Mnemonic = channel1Mnemonic,
                                        Service = channel1Service,
                                        ToolName = channel1ToolName,
                                        Uid = channel1Uid,
                                        Requirements =
                                        [
                                            new()
                                            {
                                                MaxValue = requirement1MaxValue,
                                                MinValue = requirement1MinValue,
                                                Purpose = requirement1Purpose,
                                                Uid = requirement1Uid
                                            }
                                        ]
                                    },
                                    new WitsmlChannelConfiguration
                                    {
                                        Criticality = channel2Criticality,
                                        Description = channel2Description,
                                        IndexType = channel2IndexType,
                                        Mnemonic = channel2Mnemonic,
                                        Service = channel2Service,
                                        ToolName = channel2ToolName,
                                        Uid = channel2Uid,
                                        Requirements =
                                        [
                                            new()
                                            {
                                                MaxValue =requirement2MaxValue,
                                                MinValue = requirement2MinValue,
                                                Purpose = requirement2Purpose,
                                                Uid = requirement2Uid
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                };

            var dataWorkOrder = new WitsmlDataWorkOrder()
            {
                DataSourceConfigurationSets = dataSourceConfigurationSets
            };
            workOrders.DataWorkOrders.Add(dataWorkOrder);

            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlDataWorkOrders>(
                        ),
                        It.Is<OptionsIn>(ops =>
                            ops.ReturnElements == ReturnElements.Requested),
                        null))
                .Callback<WitsmlDataWorkOrders,
                    OptionsIn,
                    CancellationToken?>((_,
                    _,
                    _) =>
                {
                })
                .ReturnsAsync(workOrders);

            IEnumerable<DataWorkOrder> result =
                await _service.GetDataWorkOrders("", "");
            var workOrder = result.First();
            var configurationSet =
                workOrder.DataSourceConfigurationSets.First();
            var dataSourceConfiguration =
                configurationSet.DataSourceConfigurations.First();
            var channelConfiguration =
                dataSourceConfiguration.ChannelConfigurations.First();
            var channel2Configuration =
                dataSourceConfiguration.ChannelConfigurations.Last();
            var requirement1 = channelConfiguration.Requirements.First();
            var requirement2 = channel2Configuration.Requirements.First();
            Assert.Single(workOrder.DataSourceConfigurationSets);
            Assert.Single(configurationSet.DataSourceConfigurations);
            Assert.Single(channelConfiguration.Requirements);
            Assert.Equal(2, dataSourceConfiguration.ChannelConfigurations.Count);
            Assert.Equal(uidSet, configurationSet.Uid);

            Assert.Equal(dscUid, dataSourceConfiguration.Uid);
            Assert.Equal(dscDescription, dataSourceConfiguration.Description);
            Assert.Equal(dscTimeStatus, dataSourceConfiguration.TimeStatus);
            Assert.Equal(dscDepthStatus, dataSourceConfiguration.DepthStatus);
            Assert.Equal(dscName, dataSourceConfiguration.Name);
            Assert.Equal(dscStatus, dataSourceConfiguration.Status);
            Assert.Equal(dscNominalHoleSize.Uom, dataSourceConfiguration.NominalHoleSize.Uom);
            Assert.Equal(dscNominalHoleSize.Value, dataSourceConfiguration.NominalHoleSize.Value.ToString(CultureInfo.InvariantCulture));
            Assert.Equal(dscVersionNumber, dataSourceConfiguration.VersionNumber);
            Assert.Equal(channel1Uid, channelConfiguration.Uid);
            Assert.Equal(channel1Criticality, channelConfiguration.Criticality);
            Assert.Equal(channel1Description, channelConfiguration.Description);
            Assert.Equal(channel1IndexType, channelConfiguration.IndexType);
            Assert.Equal(channel1Mnemonic, channelConfiguration.Mnemonic);
            Assert.Equal(channel1Service, channelConfiguration.Service);
            Assert.Equal(channel1ToolName, channelConfiguration.ToolName);
            Assert.Equal(channel2Uid, channel2Configuration.Uid);
            Assert.Equal(channel2Criticality, channel2Configuration.Criticality);
            Assert.Equal(channel2Description, channel2Configuration.Description);
            Assert.Equal(channel2IndexType, channel2Configuration.IndexType);
            Assert.Equal(channel2Mnemonic, channel2Configuration.Mnemonic);
            Assert.Equal(channel2ToolName, channel2Configuration.ToolName);
            Assert.Equal(channel2Service, channel2Configuration.Service);

            Assert.Equal(requirement1Uid, requirement1.Uid);
            Assert.Equal(requirement1Purpose, requirement1.Purpose);
            Assert.Equal(requirement1MaxValue.Value, requirement1.MaxValue.Value.ToString(CultureInfo.InvariantCulture));
            Assert.Equal(requirement1MinValue.Uom, requirement1.MaxValue.Uom);

            Assert.Equal(requirement2Uid, requirement2.Uid);
            Assert.Equal(requirement2Purpose, requirement2.Purpose);
            Assert.Equal(requirement2MaxValue.Value, requirement2.MaxValue.Value.ToString(CultureInfo.InvariantCulture));
            Assert.Equal(requirement2MinValue.Uom, requirement2.MaxValue.Uom);
        }

        private static List<WitsmlDataWorkOrderAssetContact>
            GetAssetContacts()
        {
            var result = new List<WitsmlDataWorkOrderAssetContact>()
                {
                    new()
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

        private static List<WitsmlExtensionNameValue>
            GetExtensionNameValues()
        {
            var result = new List<WitsmlExtensionNameValue>()
                {
                    new()
                    {
                        Uid = "uid",
                        Name = "name",
                        Value = new WitsmlExtensionValue()
                        {
                            Uom = "uom", Value = "value"
                        }
                    }
                };
            return result;
        }
    }
}
