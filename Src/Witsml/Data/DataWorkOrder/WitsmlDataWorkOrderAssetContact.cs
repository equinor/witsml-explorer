using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlDataWorkOrderAssetContact
{
    [XmlAttribute("uid")]
    public string Uid { get; set; }

    [XmlElement("companyName")]
    public string CompanyName { get; set; }

    [XmlElement("name")]
    public string Name { get; set; }

    [XmlElement("role")]
    public string Role { get; set; }

    [XmlElement("emailAddress")]
    public string EmailAddress { get; set; }

    [XmlElement("phoneNum")]
    public string PhoneNum { get; set; }

    [XmlElement("availability")]
    public string Availability { get; set; }

    [XmlElement("timeZone")]
    public string TimeZone { get; set; }

    [XmlElement("extensionNameValue")]
    public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
}
