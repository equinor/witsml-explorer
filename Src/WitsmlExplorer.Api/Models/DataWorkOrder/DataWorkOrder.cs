using System.Collections.Generic;
using System.Linq;

using Witsml.Data.DataWorkOrder;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class DataWorkOrder : ObjectOnWellbore
{
    public string Field { get; set; }

    public string DataProvider { get; set; }

    public string DataConsumer { get; set; }

    public string Description { get; set; }

    public string DTimPlannedStart { get; set; }

    public string DTimPlannedStop { get; set; }

    public List<DataWorkOrderAssetContact> AssetContacts { get; set; }

    public List<DataSourceConfigurationSet> DataSourceConfigurationSets { get; set; }

    public string DwoVersion { get; set; }

    public CommonData CommonData { get; init; }

    public override WitsmlDataWorkOrders ToWitsml()
    {
        return new WitsmlDataWorkOrder
        {
            UidWell = WellUid,
            NameWell = WellName,
            UidWellbore = WellboreUid,
            NameWellbore = WellboreName,
            Uid = Uid,
            Name = Name,
            Field = Field,
            DataProvider = DataProvider,
            DataConsumer = DataConsumer,
            Description = Description,
            DTimPlannedStart = StringHelpers.ToUniversalDateTimeString(DTimPlannedStart),
            DTimPlannedStop = StringHelpers.ToUniversalDateTimeString(DTimPlannedStop),
            AssetContacts = AssetContacts?.Select(assetContact => assetContact?.ToWitsml())?.ToList(),
            DataSourceConfigurationSets = DataSourceConfigurationSets?.Select(configurationSet => configurationSet?.ToWitsml())?.ToList(),
            DwoVersion = DwoVersion,
            CommonData = CommonData?.ToWitsml(),
        }.AsItemInWitsmlList();
    }

    public static DataWorkOrder FromWitsml(WitsmlDataWorkOrder dataWorkOrder)
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

    private static List<DataSourceConfiguration> GetDataSourceConfigurationsFromWitsml(List<WitsmlDataSourceConfiguration> configurations)
    {
        return configurations?.Select(configuration =>
            new DataSourceConfiguration
            {
                Uid = configuration.Uid,
                Name = configuration.Name,
                Description = configuration.Description,
                NominalHoleSize = LengthMeasure.FromWitsml(configuration.NominalHoleSize),
                Status = configuration.Status,
                TimeStatus = configuration.TimeStatus,
                DepthStatus = configuration.DepthStatus,
                DTimPlannedStart = configuration.DTimPlannedStart,
                DTimPlannedStop = configuration.DTimPlannedStop,
                MDPlannedStop = LengthMeasure.FromWitsml(configuration.MDPlannedStop),
                MDPlannedStart = LengthMeasure.FromWitsml(configuration.MDPlannedStart),
                DTimChangeDeadline = configuration.DTimChangeDeadline,
                ChannelConfigurations = GetChannelConfigurationsFromWitsml(configuration.ChannelConfigurations),
                ChangeReason = GetConfigurationChangeReasonFromWitsml(configuration.ChangeReason),
                VersionNumber = configuration.VersionNumber
            })
        .ToList();
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

    private static ConfigurationChangeReason GetConfigurationChangeReasonFromWitsml(WitsmlConfigurationChangeReason reason)
    {
        return reason == null ? null : new ConfigurationChangeReason
        {
            ChangedBy = reason.ChangedBy,
            DTimChanged = reason.DTimChanged,
            IsChangedDataRequirements = reason.IsChangedDataRequirements,
            Comments = reason.Comments,
            ChannelsAdded = reason.ChannelsAdded,
            ChannelsModified = reason.ChannelsModified,
            ChannelsRemoved = reason.ChannelsRemoved
        };
    }
}

