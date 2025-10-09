using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlConfigurationChangeReason
{
    [XmlElement("changedBy")]
    public string ChangedBy { get; set; }

    [XmlElement("dTimChanged")]
    public string DTimChanged { get; set; }

    [XmlIgnore]
    public bool? IsChangedDataRequirements { get; set; }
    [XmlElement("isChangedDataRequirements")]
    public string IsChangedDataRequirementsText
    {
        get => IsChangedDataRequirements.HasValue ? XmlConvert.ToString(IsChangedDataRequirements.Value) : null;
        set => IsChangedDataRequirements = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
    }

    [XmlElement("comments")]
    public string Comments { get; set; }

    [XmlElement("channelAdded")]
    public List<string> ChannelsAdded { get; set; }

    [XmlElement("channelModified")]
    public List<string> ChannelsModified { get; set; }

    [XmlElement("channelRemoved")]
    public List<string> ChannelsRemoved { get; set; }

    [XmlElement("extensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
}
