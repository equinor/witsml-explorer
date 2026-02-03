using System.Collections.Generic;
using System.Linq;

using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;


namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class DataSourceConfiguration
{
    public string Uid { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public LengthMeasure NominalHoleSize { get; set; }
    public RefNameString Tubular { get; set; }
    public string Status { get; set; }
    public string TimeStatus { get; set; }
    public string DepthStatus { get; set; }
    public string DTimPlannedStart { get; set; }
    public string DTimPlannedStop { get; set; }
    public LengthMeasure MDPlannedStart { get; set; }
    public LengthMeasure MDPlannedStop { get; set; }
    public string DTimChangeDeadline { get; set; }
    public List<ChannelConfiguration> ChannelConfigurations { get; set; }
    public ConfigurationChangeReason ChangeReason { get; set; }
    public short VersionNumber { get; set; }
}

public static class DataSourceConfigurationExtensions
{
    public static WitsmlDataSourceConfiguration ToWitsml(this DataSourceConfiguration dataSourceConfiguration)
    {
        return new WitsmlDataSourceConfiguration
        {
            Uid = dataSourceConfiguration.Uid,
            Name = dataSourceConfiguration.Name,
            Description = dataSourceConfiguration.Description,
            NominalHoleSize = dataSourceConfiguration.NominalHoleSize?.ToWitsml<WitsmlLengthMeasure>(),
            Tubular = dataSourceConfiguration.Tubular.ToWitsml(),
            Status = dataSourceConfiguration.Status,
            TimeStatus = dataSourceConfiguration.TimeStatus,
            DepthStatus = dataSourceConfiguration.DepthStatus,
            DTimPlannedStart = StringHelpers.ToUniversalDateTimeString(dataSourceConfiguration.DTimPlannedStart),
            DTimPlannedStop = StringHelpers.ToUniversalDateTimeString(dataSourceConfiguration.DTimPlannedStop),
            MDPlannedStart = dataSourceConfiguration.MDPlannedStart?.ToWitsml<WitsmlLengthMeasure>(),
            MDPlannedStop = dataSourceConfiguration.MDPlannedStop?.ToWitsml<WitsmlLengthMeasure>(),
            DTimChangeDeadline = StringHelpers.ToUniversalDateTimeString(dataSourceConfiguration.DTimChangeDeadline),
            ChannelConfigurations = dataSourceConfiguration.ChannelConfigurations.Select(channelConfiguration => channelConfiguration?.ToWitsml())?.ToList(),
            ChangeReason = dataSourceConfiguration.ChangeReason?.ToWitsml(),
            VersionNumber = dataSourceConfiguration.VersionNumber
        };
    }
}


