using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.DataWorkOrder;
using System;

public class WitsmlDataSourceConfiguration
{
    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("name")]
    public string Name { get; set; }

    [XmlElement("description")]
    public string Description { get; set; }

    [XmlElement("nominalHoleSize")]
    public WitsmlLengthMeasure NominalHoleSize { get; set; }

    [XmlElement("tubular")]
    public WitsmlRefNameString Tubular { get; set; }

    [XmlElement("status")]
    public string Status { get; set; }

    [XmlElement("timeStatus")]
    public string TimeStatus { get; set; }

    [XmlElement("depthStatus")]
    public string DepthStatus { get; set; }

    [XmlElement("dTimPlannedStart")]
    public string DTimPlannedStart { get; set; }

    [XmlElement("dTimPlannedStop")]
    public string DTimPlannedStop { get; set; }

    [XmlElement("mDPlannedStart")]
    public WitsmlLengthMeasure MDPlannedStart { get; set; }

    [XmlElement("mDPlannedStop")]
    public WitsmlLengthMeasure MDPlannedStop { get; set; }

    [XmlElement("dTimChangeDeadline")]
    public string DTimChangeDeadline { get; set; }

    [XmlElement("channelConfiguration")]
    public List<WitsmlChannelConfiguration> ChannelConfigurations { get; set; }

    [XmlElement("changeReason")]
    public WitsmlConfigurationChangeReason ChangeReason { get; set; }

    [XmlElement("customData")]
    public WitsmlCustomData CustomData { get; set; }

    [XmlElement("ExtensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

    [XmlAttribute("versionNumber")]
    public short VersionNumber { get; set; }
}
