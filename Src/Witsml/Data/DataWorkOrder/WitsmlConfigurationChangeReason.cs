using System;
using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlConfigurationChangeReason
{
    [XmlElement("changedBy")]
    public string ChangedBy { get; set; }

    [XmlElement("dTimChanged")]
    public DateTime DTimChanged { get; set; }

    [XmlElement("isChangedDataRequirements")]
    public bool IsChangedDataRequirements { get; set; }

    [XmlElement("comments")]
    public string Comments { get; set; }

    [XmlElement("channelAdded")]
    public string[] ChannelAdded { get; set; }

    [XmlElement("channelModified")]
    public string[] ChannelModified { get; set; }

    [XmlElement("channelRemoved")]
    public string[] ChannelRemoved { get; set; }

    [XmlElement("extensionNameValue")]
    public WitsmlExtensionNameValue[] ExtensionNameValue { get; set; }
}
