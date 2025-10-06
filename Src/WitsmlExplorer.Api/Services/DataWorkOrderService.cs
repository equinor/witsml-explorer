using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IDataWorkOrderService
    {
        Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string orderUid);
        Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid);
    }

    public class DataWorkOrderService : WitsmlService, IDataWorkOrderService
    {
        public DataWorkOrderService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string orderUid)
        {
            WitsmlDataWorkOrders query = DataWorkOrderQueries.QueryById(wellUid, wellboreUid, orderUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            var workOrderObject = result.DataWorkOrders.FirstOrDefault();
            return DataWorkOrderFromWitsml(workOrderObject);
        }

        public async Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid)
        {
            WitsmlDataWorkOrders witsmlDataWorkOrders = DataWorkOrderQueries.GetWitsmlWorkOrder(wellUid, wellboreUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(witsmlDataWorkOrders, new OptionsIn(ReturnElements.Requested));
            return result.DataWorkOrders.Select(DataWorkOrderFromWitsml).OrderBy(dataWorkOrder => dataWorkOrder.Name).ToList();
        }

        private static List<DataSourceConfigurationSet> GetConfigurationSets(List<WitsmlDataSourceConfigurationSet> configurationSets)
        {
            return configurationSets.Select(configurationSet =>
                new DataSourceConfigurationSet
                {
                    Uid = configurationSet.Uid,
                    DataSourceConfigurations = GetConfigurations(configurationSet.DataSourceConfigurations),
                }
            ).ToList();
        }

        private static List<ChannelConfiguration> GetChannelConfigurations(List<WitsmlChannelConfiguration> configurations)
        {
            return configurations.Select(configuration =>
                new ChannelConfiguration
                {
                    Uid = configuration.Uid,
                    Uom = configuration.Uom,
                    Mnemonic = configuration.Mnemonic,
                    GlobalMnemonic = configuration.GlobalMnemonic,
                    IndexType = configuration.IndexType.ConvertEnum<LogIndexType>(),
                    ToolName = configuration.ToolName,
                    Service = configuration.Service,
                    SensorOffset = LengthMeasure.FromWitsml(configuration.SensorOffset),
                    Criticality = configuration.Criticality.ConvertEnum<ChannelCriticality>(),
                    LogName = configuration.LogName,
                    Description = configuration.Description,
                    Comments = configuration.Comments,
                    Requirements = GetChannelRequirementsFromWitsml(configuration.Requirements)
                }
            ).ToList();
        }

        private static List<ChannelRequirement> GetChannelRequirementsFromWitsml(List<WitsmlChannelRequirement> requirements)
        {
            return requirements.Select(requirement =>
                    new ChannelRequirement
                    {
                        Uid = requirement.Uid,
                        Purpose = requirement.Purpose.ConvertEnum<RequirementPurpose>(),
                        MinInterval = TimeMeasure.FromWitsml(requirement.MinInterval),
                        MaxInterval = TimeMeasure.FromWitsml(requirement.MaxInterval),
                        MinPrecision = GenericMeasure.FromWitsml(requirement.MinPrecision),
                        MaxPrecision = GenericMeasure.FromWitsml(requirement.MaxPrecision),
                        MinValue = GenericMeasure.FromWitsml(requirement.MinValue),
                        MaxValue = GenericMeasure.FromWitsml(requirement.MaxValue),
                        MinStep = LengthMeasure.FromWitsml(requirement.MinStep),
                        MaxStep = LengthMeasure.FromWitsml(requirement.MaxStep),
                        MinDelta = GenericMeasure.FromWitsml(requirement.MinDelta),
                        MaxDelta = GenericMeasure.FromWitsml(requirement.MaxDelta),
                        Latency = TimeMeasure.FromWitsml(requirement.Latency),
                        MdThreshold = LengthMeasure.FromWitsml(requirement.MdThreshold),
                        DynamicMdThreshold = requirement.DynamicMdThreshold,
                        Comments = requirement.Comments
                    })
                .ToList();
        }

        private static List<DataSourceConfiguration> GetConfigurations(List<WitsmlDataSourceConfiguration> configurations)
        {
            return configurations.Select(configuration =>
                    new DataSourceConfiguration
                    {
                        Uid = configuration.Uid,
                        Name = configuration.Name,
                        Description = configuration.Description,
                        NominalHoleSize = LengthMeasure.FromWitsml(configuration.NominalHoleSize),
                        Status = configuration.Status.ConvertEnum<SectionOrderStatus>(),
                        TimeStatus = configuration.TimeStatus.ConvertEnum<OperationStatus>(),
                        DepthStatus = configuration.DepthStatus.ConvertEnum<OperationStatus>(),
                        DTimPlannedStart = configuration.DTimPlannedStart,
                        DTimPlannedStop = configuration.DTimPlannedStop,
                        MDPlannedStop = LengthMeasure.FromWitsml(configuration.MDPlannedStop),
                        MDPlannedStart = LengthMeasure.FromWitsml(configuration.MDPlannedStart),
                        DTimChangeDeadline = configuration.DTimChangeDeadline,
                        ChannelConfigurations = GetChannelConfigurations(configuration.ChannelConfigurations),
                        ChangeReason = GetCongurationChangeReasonFromWitsml(configuration.ChangeReason),
                        VersionNumber = configuration.VersionNumber
                    })
                .ToList();
        }

        private static ConfigurationChangeReason GetCongurationChangeReasonFromWitsml(WitsmlConfigurationChangeReason reason)
        {
            var result = new ConfigurationChangeReason()
            {
                ChangedBy = reason.ChangedBy,
                DTimChanged = reason.DTimChanged,
                IsChangedDataRequirements = reason.IsChangedDataRequirements,
                Comments = reason.Comments,
                ChannelsAdded = reason.ChannelsAdded,
                ChannelsModified = reason.ChannelsModified,
                ChannelsRemoved = reason.ChannelsRemoved
            };
            return result;
        }

        private static DataWorkOrder DataWorkOrderFromWitsml(WitsmlDataWorkOrder dataWorkOrder)
        {
            return new DataWorkOrder
            {
                Uid = dataWorkOrder.Uid,
                Name = dataWorkOrder.Name,
                WellboreUid = dataWorkOrder.UidWellbore,
                WellboreName = dataWorkOrder.NameWellbore,
                WellUid = dataWorkOrder.UidWell,
                WellName = dataWorkOrder.NameWell,
                DataProvider = dataWorkOrder.DataProvider,
                DataConsumer = dataWorkOrder.DataConsumer,
                DTimPlannedStart = dataWorkOrder.DTimPlannedStart,
                DTimPlannedStop = dataWorkOrder.DTimPlannedStop,
                DataSourceConfigurationSets = GetConfigurationSets(dataWorkOrder.DataSourceConfigurationSets),
                CommonData = new CommonData()
                {
                    DTimCreation = dataWorkOrder.CommonData.DTimCreation,
                    DTimLastChange = dataWorkOrder.CommonData.DTimLastChange,
                    ItemState = dataWorkOrder.CommonData.ItemState,
                    Comments = dataWorkOrder.CommonData.Comments,
                    DefaultDatum = dataWorkOrder.CommonData.DefaultDatum,
                    SourceName = dataWorkOrder.CommonData.SourceName,
                    ServiceCategory = dataWorkOrder.CommonData.ServiceCategory
                }
            };
        }
    }
}
