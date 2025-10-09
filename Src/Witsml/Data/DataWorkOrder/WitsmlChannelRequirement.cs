using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlChannelRequirement
{
    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("purpose")]
    public string Purpose { get; set; }

    [XmlElement("minInterval")]
    public WitsmlTimeMeasure MinInterval { get; set; }

    [XmlElement("maxInterval")]
    public WitsmlTimeMeasure MaxInterval { get; set; }

    [XmlElement("minPrecision")]
    public Measure MinPrecision { get; set; }

    [XmlElement("maxPrecision")]
    public Measure MaxPrecision { get; set; }

    [XmlElement("minValue")]
    public Measure MinValue { get; set; }

    [XmlElement("maxValue")]
    public Measure MaxValue { get; set; }

    [XmlElement("minStep")]
    public WitsmlLengthMeasure MinStep { get; set; }

    [XmlElement("maxStep")]
    public WitsmlLengthMeasure MaxStep { get; set; }

    [XmlElement("minDelta")]
    public Measure MinDelta { get; set; }

    [XmlElement("maxDelta")]
    public Measure MaxDelta { get; set; }

    [XmlElement("latency")]
    public WitsmlTimeMeasure Latency { get; set; }

    [XmlElement("mdThreshold")]
    public WitsmlLengthMeasure MdThreshold { get; set; }

    [XmlIgnore]
    public bool? DynamicMdThreshold { get; set; }
    [XmlElement("dynamicMdThreshold")]
    public string DynamicMdThresholdText
    {
        get => DynamicMdThreshold.HasValue ? XmlConvert.ToString(DynamicMdThreshold.Value) : null;
        set => DynamicMdThreshold = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
    }

    [XmlElement("comments")]
    public string Comments { get; set; }

    [XmlElement("extensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

}
