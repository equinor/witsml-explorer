using System.Xml.Serialization;

using Witsml.Xml;

namespace Witsml.Data
{
    [XmlRoot("capClients", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlClientCapabilitiesRoot
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1";

        [XmlElement("capClient")]
        public WitsmlClientCapabilities ClientCapabilities { get; init; }
    }

    public class WitsmlClientCapabilities
    {
        [XmlAttribute("apiVers")]
        public string ApiVersion = "1.4.1";

        [XmlElement("contact")]
        public ContactInformation Contact { get; init; }

        [XmlElement("description")]
        public string Description { get; init; }

        [XmlElement("name")]
        public string Name { get; init; }

        [XmlElement("vendor")]
        public string Vendor { get; init; }

        [XmlElement("version")]
        public string Version { get; init; }

        [XmlElement("schemaVersion")]
        public string SchemaVersion = "1.3.1.1,1.4.1.1";

        public string ToXml()
        {
            WitsmlClientCapabilitiesRoot capClients = new() { ClientCapabilities = this };
            return XmlHelper.Serialize(capClients);
        }
    }

    public class ContactInformation
    {
        [XmlElement("name")]
        public string Name { get; init; }

        [XmlElement("email")]
        public string Email { get; init; }

        [XmlElement("phone")]
        public string Phone { get; init; }
    }
}
