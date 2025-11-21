using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlDataSourceConfigurationSet
{

    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("dataSourceConfiguration")]
    public List<WitsmlDataSourceConfiguration> DataSourceConfigurations { get; set; }

    [XmlElement("extensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
}
