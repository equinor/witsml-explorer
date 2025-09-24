using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlChannelConfiguration
{
    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("mnemonic")]
    public WitsmlShortNameStruct Mnemonic { get; set; }

    [XmlElement("uom")]
    public string Uom { get; set; }

    [XmlElement("globalMnemonic")]
    public WitsmlShortNameStruct GlobalMnemonic { get; set; }

    [XmlElement("indexType")]
    public WitsmlLogIndexType IndexType { get; set; }

    [XmlElement("toolName")]
    public string ToolName { get; set; }

    [XmlElement("service")]
    public string Service { get; set; }

    [XmlElement("sensorOffset")]
    public WitsmlLengthMeasure SensorOffset { get; set; }

    [XmlElement("criticality")]
    public WitsmlChannelCriticality Criticality { get; set; }

    [XmlIgnore]
    public bool CriticalitySpecified { get; set; }

    [XmlElement("logName")]
    public string LogName { get; set; }

    [XmlElement("description")]
    public string Description { get; set; }

    [XmlElement("comments")]
    public string Comments { get; set; }

    [XmlElement("requirement")]
    public WitsmlChannelRequirement[] Requirement { get; set; }

    [XmlElement("customData")]
    public WitsmlCustomData CustomData { get; set; }

    [XmlElement("extensionNameValue")]
    public WitsmlExtensionNameValue[] ExtensionNameValue { get; set; }
}
