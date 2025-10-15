using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.DataWorkOrder;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IDataWorkOrderService
    {
        Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid);
        Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid);
        Task<ICollection<DataSourceConfigurationSet>> GetDataSourceConfigurationSets(string wellUid, string wellboreUid, string dwoUid);
    }

    public class DataWorkOrderService : WitsmlService, IDataWorkOrderService
    {
        public DataWorkOrderService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid)
        {
            WitsmlDataWorkOrders query = DataWorkOrderQueries.GetShortWitsmlDataWorkOrder(wellUid, wellboreUid, dwoUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            var workOrderObject = result.DataWorkOrders.FirstOrDefault();
            return GetDataWorkOrderFromWitsml(workOrderObject);
        }

        public async Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid)
        {
            WitsmlDataWorkOrders dwoQuery = DataWorkOrderQueries.GetShortWitsmlDataWorkOrder(wellUid, wellboreUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(dwoQuery, new OptionsIn(ReturnElements.Requested));
            return result.DataWorkOrders.Select(GetDataWorkOrderFromWitsml).OrderBy(dataWorkOrder => dataWorkOrder.Name).ToList();
        }

        public async Task<ICollection<DataSourceConfigurationSet>> GetDataSourceConfigurationSets(string wellUid, string wellboreUid, string dwoUid)
        {
            WitsmlDataWorkOrders dwoQuery = DataWorkOrderQueries.QueryById(wellUid, wellboreUid, dwoUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(dwoQuery, new OptionsIn(ReturnElements.All));
            var witsmlDataSourceConfigurationSets = result?.DataWorkOrders?.FirstOrDefault()?.DataSourceConfigurationSets;
            var dataSourceConfigurationSets = GetDataSourceConfigurationSetsFromWitsml(witsmlDataSourceConfigurationSets);
            return dataSourceConfigurationSets;
        }

        private static List<DataSourceConfigurationSet> GetDataSourceConfigurationSetsFromWitsml(List<WitsmlDataSourceConfigurationSet> configurationSets)
        {
            return configurationSets?.Select(configurationSet =>
                new DataSourceConfigurationSet
                {
                    Uid = configurationSet.Uid,
                    DataSourceConfigurations = GetDataSourceConfigurationsFromWitsml(configurationSet.DataSourceConfigurations),
                }
            ).ToList();
        }

        private static List<ChannelConfiguration> GetChannelConfigurationsFromWitsml(List<WitsmlChannelConfiguration> configurations)
        {
            return configurations?.Select(configuration =>
                new ChannelConfiguration
                {
                    Uid = configuration.Uid,
                    Uom = configuration.Uom,
                    Mnemonic = configuration.Mnemonic,
                    GlobalMnemonic = configuration.GlobalMnemonic,
                    IndexType = configuration.IndexType,
                    ToolName = configuration.ToolName,
                    Service = configuration.Service,
                    SensorOffset = LengthMeasure.FromWitsml(configuration.SensorOffset),
                    Criticality = configuration.Criticality,
                    LogName = configuration.LogName,
                    Description = configuration.Description,
                    Comments = configuration.Comments,
                    Requirements = GetChannelRequirementsFromWitsml(configuration.Requirements)
                }
            ).ToList();
        }

        private static List<ChannelRequirement> GetChannelRequirementsFromWitsml(List<WitsmlChannelRequirement> requirements)
        {
            return requirements?.Select(requirement =>
                    new ChannelRequirement
                    {
                        Uid = requirement.Uid,
                        Purpose = requirement.Purpose,
                        MinInterval = TimeMeasure.FromWitsml(requirement.MinInterval),
                        MaxInterval = TimeMeasure.FromWitsml(requirement.MaxInterval),
                        MinPrecision = LengthMeasure.FromWitsml(requirement.MinPrecision),
                        MaxPrecision = LengthMeasure.FromWitsml(requirement.MaxPrecision),
                        MinValue = LengthMeasure.FromWitsml(requirement.MinValue),
                        MaxValue = LengthMeasure.FromWitsml(requirement.MaxValue),
                        MinStep = LengthMeasure.FromWitsml(requirement.MinStep),
                        MaxStep = LengthMeasure.FromWitsml(requirement.MaxStep),
                        MinDelta = LengthMeasure.FromWitsml(requirement.MinDelta),
                        MaxDelta = LengthMeasure.FromWitsml(requirement.MaxDelta),
                        Latency = TimeMeasure.FromWitsml(requirement.Latency),
                        MdThreshold = LengthMeasure.FromWitsml(requirement.MdThreshold),
                        DynamicMdThreshold = requirement.DynamicMdThreshold,
                        Comments = requirement.Comments
                    })
                .ToList();
        }

        private static List<DataSourceConfiguration>
            GetDataSourceConfigurationsFromWitsml(
                List<WitsmlDataSourceConfiguration> configurations)
        {
            return configurations?.Select(configuration =>
                new DataSourceConfiguration
                {
                    Uid = configuration.Uid,
                    Name = configuration.Name,
                    Description = configuration.Description,
                    NominalHoleSize =
                        LengthMeasure.FromWitsml(configuration
                            .NominalHoleSize),
                    Status = configuration.Status,
                    TimeStatus =
                        configuration.TimeStatus,
                    DepthStatus =
                        configuration.DepthStatus,
                    DTimPlannedStart = configuration.DTimPlannedStart,
                    DTimPlannedStop = configuration.DTimPlannedStop,
                    MDPlannedStop =
                        LengthMeasure.FromWitsml(configuration
                            .MDPlannedStop),
                    MDPlannedStart =
                        LengthMeasure.FromWitsml(configuration
                            .MDPlannedStart),
                    DTimChangeDeadline =
                        configuration.DTimChangeDeadline,
                    ChannelConfigurations =
                        GetChannelConfigurationsFromWitsml(configuration
                            .ChannelConfigurations),
                    ChangeReason =
                        GetConfigurationChangeReasonFromWitsml(
                            configuration.ChangeReason),
                    VersionNumber = configuration.VersionNumber
                })
            .ToList();
        }

        private static ConfigurationChangeReason GetConfigurationChangeReasonFromWitsml(WitsmlConfigurationChangeReason reason)
        {
            if (reason == null)
                return null;
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

        private static List<DataWorkOrderAssetContact> GetAssetContactsFromWitsml(List<WitsmlDataWorkOrderAssetContact> assetContacts)
        {
            return assetContacts?.Select(contact =>
                new DataWorkOrderAssetContact
                {
                    Uid = contact.Uid,
                    CompanyName = contact.CompanyName,
                    Name = contact.Name,
                    Role = contact.Role,
                    EmailAddress = contact.EmailAddress,
                    PhoneNum = contact.PhoneNum,
                    Availability = contact.Availability,
                    TimeZone = contact.TimeZone
                }
            ).ToList();
        }

        private static DataWorkOrder GetDataWorkOrderFromWitsml(WitsmlDataWorkOrder dataWorkOrder)
        {
            return dataWorkOrder == null ? null : new DataWorkOrder
            {
                Uid = dataWorkOrder.Uid,
                Name = dataWorkOrder.Name,
                WellboreUid = dataWorkOrder.UidWellbore,
                WellboreName = dataWorkOrder.NameWellbore,
                WellUid = dataWorkOrder.UidWell,
                WellName = dataWorkOrder.NameWell,
                Field = dataWorkOrder.Field,
                DataProvider = dataWorkOrder.DataProvider,
                DataConsumer = dataWorkOrder.DataConsumer,
                Description = dataWorkOrder.Description,
                DTimPlannedStart = dataWorkOrder.DTimPlannedStart,
                DTimPlannedStop = dataWorkOrder.DTimPlannedStop,
                AssetContacts = GetAssetContactsFromWitsml(dataWorkOrder.AssetContacts),
                DataSourceConfigurationSets = GetDataSourceConfigurationSetsFromWitsml(dataWorkOrder.DataSourceConfigurationSets),
                CommonData = new CommonData()
                {
                    DTimCreation = dataWorkOrder.CommonData?.DTimCreation,
                    DTimLastChange = dataWorkOrder.CommonData?.DTimLastChange,
                    ItemState = dataWorkOrder.CommonData?.ItemState,
                    Comments = dataWorkOrder.CommonData?.Comments,
                    DefaultDatum = dataWorkOrder.CommonData?.DefaultDatum,
                    SourceName = dataWorkOrder.CommonData?.SourceName,
                    ServiceCategory = dataWorkOrder.CommonData?.ServiceCategory
                }
            };
        }
    }
}
