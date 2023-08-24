using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("capServers", Namespace = "http://www.witsml.org/api/141")]
    public class WitsmlCapServers
    {
        [XmlAttribute("version")]
        public string Version { get; init; }

        [XmlElement("capServer")]
        public List<WitsmlServerCapabilities> ServerCapabilities { get; init; }
    }

    public class WitsmlServerCapabilities
    {
        [XmlAttribute("apiVers")]
        public string ApiVers { get; init; }

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
        public string SchemaVersion { get; init; }

        [XmlElement("maxRequestLatestValues")]
        public int MaxRequestLatestValues { get; init; }

        [XmlElement("function")]
        public List<WitsmlFunction> Functions { get; init; }
    }

    public class WitsmlFunction
    {
        [XmlAttribute("name")]
        public string Name { get; init; }

        [XmlElement("dataObject")]
        public List<WitsmlFunctionDataObject> DataObjects { get; init; }
    }

    public class WitsmlFunctionDataObject
    {
        [XmlText]
        public string Name { get; init; }

        [XmlAttribute("maxDataNodes")]
        public int MaxDataNodes { get; init; }

        [XmlAttribute("maxDataPoints")]
        public int MaxDataPoints { get; init; }
    }
}
