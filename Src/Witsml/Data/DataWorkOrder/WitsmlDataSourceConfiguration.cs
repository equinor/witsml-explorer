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
    public WitsmlSectionOrderStatus Status { get; set; }

    [XmlIgnore]
    public bool StatusSpecified { get; set; }

    [XmlElement("timeStatus")]
    public WitsmlOperationStatus TimeStatus { get; set; }

    [XmlIgnore]
    public bool TimeStatusSpecified { get; set; }

    [XmlElement("depthStatus")]
    public WitsmlOperationStatus DepthStatus { get; set; }

    [XmlIgnore]
    public bool DepthStatusSpecified { get; set; }

    [XmlElement("dTimPlannedStart")]
    public DateTime DTimPlannedStart { get; set; }

    [XmlElement("dTimPlannedStartSpecified")]
    public bool DTimPlannedStartSpecified { get; set; }

    [XmlElement("dTimPlannedStop")]
    public DateTime DTimPlannedStop { get; set; }

    [XmlElement("dTimPlannedStopSpecified")]
    public bool DTimPlannedStopSpecified { get; set; }

    [XmlElement("mDPlannedStart")]
    public WitsmlLengthMeasure MDPlannedStart { get; set; }

    [XmlElement("mDPlannedStop")]
    public WitsmlLengthMeasure MDPlannedStop { get; set; }

    [XmlElement("dTimChangeDeadline")]
    public DateTime DTimChangeDeadline { get; set; }

    [XmlElement("dTimChangeDeadlineSpecified")]
    public bool DTimChangeDeadlineSpecified { get; set; }

    [XmlElement("channelConfiguration")]
    public WitsmlChannelConfiguration[] ChannelConfiguration { get; set; }

    [XmlElement("changeReason")]
    public WitsmlConfigurationChangeReason ChangeReason { get; set; }

    [XmlElement("customData")]
    public WitsmlCustomData CustomData { get; set; }

    [XmlElement("ExtensionNameValue")]
    public WitsmlExtensionNameValue[] ExtensionNameValue { get; set; }

    [XmlElement("versionNumber")]
    public short VersionNumber { get; set; }

    public bool VersionNumberSpecified { get; set; }
}
