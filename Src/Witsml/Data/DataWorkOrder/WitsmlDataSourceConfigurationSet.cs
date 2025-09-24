using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlDataSourceConfigurationSet
{
    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("dataSourceConfiguration")]
    public WitsmlDataSourceConfiguration[] DataSourceConfiguration { get; set; }

    [XmlElement("extensionNameValue")]
    public WitsmlExtensionNameValue[] ExtensionNameValue { get; set; }
}
