using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlConfigurationChangeReason
{
    [XmlElement("changedBy")]
    public string ChangedBy { get; set; }

    [XmlElement("dTimChanged")]
    public string DTimChanged { get; set; }

    [XmlElement("isChangedDataRequirements")]
    public bool IsChangedDataRequirements { get; set; }

    [XmlElement("comments")]
    public string Comments { get; set; }

    [XmlElement("channelAdded")]
    public List<string> ChannelAdded { get; set; }

    [XmlElement("channelModified")]
    public List<string> ChannelModified { get; set; }

    [XmlElement("channelRemoved")]
    public List<string> ChannelRemoved { get; set; }

    [XmlElement("extensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
}
