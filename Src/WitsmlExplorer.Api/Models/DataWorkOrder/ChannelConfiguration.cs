using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class ChannelConfiguration
{
    public string Uid { get; set; }
    public string Mnemonic { get; set; }
    public string Uom { get; set; }
    public string GlobalMnemonic { get; set; }
    public LogIndexType IndexType { get; set; }
    public string ToolName { get; set; }
    public string Service { get; set; }
    public LengthMeasure SensorOffset { get; set; }
    public ChannelCriticality Criticality { get; set; }
    public string LogName { get; set; }
    public string Description { get; set; }
    public string Comments { get; set; }
    public List<ChannelRequirement> Requirements { get; set; }
}

public static class ChannelConfigurationExtensions
{
    public static WitsmlChannelConfiguration ToWitsml(this ChannelConfiguration channelConfiguration)
    {
        return new WitsmlChannelConfiguration
        {
            Uid = channelConfiguration.Uid,
            Mnemonic = channelConfiguration.Mnemonic,
            Uom = channelConfiguration.Uom,
            GlobalMnemonic = channelConfiguration.GlobalMnemonic,
            IndexType = channelConfiguration.IndexType.ConvertEnum<WitsmlLogIndexType>(),
            ToolName = channelConfiguration.ToolName,
            Service = channelConfiguration.Service,
            SensorOffset = channelConfiguration.SensorOffset.ToWitsml<WitsmlLengthMeasure>(),
            Criticality = channelConfiguration.Criticality.ConvertEnum<WitsmlChannelCriticality>(),
            LogName = channelConfiguration.LogName,
            Comments = channelConfiguration.Comments,
            Description = channelConfiguration.Description,
        };
    }
}
