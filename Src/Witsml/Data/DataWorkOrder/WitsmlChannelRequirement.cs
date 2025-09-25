using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlChannelRequirement
{
    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("purpose")]
    public WitsmlRequirementPurpose Purpose { get; set; }

    [XmlElement("minInterval")]
    public WitsmlTimeMeasure MinInterval { get; set; }

    [XmlElement("maxInterval")]
    public WitsmlTimeMeasure MaxInterval { get; set; }

    [XmlElement("minPrecision")]
    public WitsmlGenericMeasure MinPrecision { get; set; }

    [XmlElement("maxPrecision")]
    public WitsmlGenericMeasure MaxPrecision { get; set; }

    [XmlElement("minValue")]
    public WitsmlGenericMeasure MinValue { get; set; }

    [XmlElement("maxValue")]
    public WitsmlGenericMeasure MaxValue { get; set; }

    [XmlElement("minStep")]
    public WitsmlLengthMeasure MinStep { get; set; }

    [XmlElement("maxStep")]
    public WitsmlLengthMeasure MaxStep { get; set; }

    [XmlElement("minDelta")]
    public WitsmlGenericMeasure MinDelta { get; set; }

    [XmlElement("maxDelta")]
    public WitsmlGenericMeasure MaxDelta { get; set; }

    [XmlElement("atency")]
    public WitsmlTimeMeasure Latency { get; set; }

    [XmlElement("mdThreshold")]
    public WitsmlLengthMeasure MdThreshold { get; set; }

    [XmlElement("dynamicMdThreshold")]
    public bool DynamicMdThreshold { get; set; }

    [XmlElement("comments")]
    public string Comments { get; set; }

    [XmlElement("extensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

}
