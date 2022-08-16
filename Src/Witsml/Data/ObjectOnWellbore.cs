using System.Xml.Serialization;


namespace Witsml.Data
{
    public abstract class ObjectOnWellbore<T> where T : IWitsmlQueryType
    {
        public abstract T AsSingletonWitsmlList();

        [XmlAttribute("uidWell")]
        public string UidWell { get; set; }
        [XmlAttribute("uidWellbore")]
        public string UidWellbore { get; set; }
        [XmlAttribute("uid")]
        public string Uid { get; set; }
        [XmlElement("nameWell")]
        public string NameWell { get; set; }
        [XmlElement("nameWellbore")]
        public string NameWellbore { get; set; }
        [XmlElement("name")]
        public string Name { get; set; }
    }
}
