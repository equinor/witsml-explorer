using System.Collections.Generic;
using System.Xml.Serialization;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class ChannelConfiguration
{
    public string Uid { get; set; }
    public ShortNameStruct Mnemonic { get; set; }
    public string Uom { get; set; }
    public ShortNameStruct GlobalMnemonic { get; set; }
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
