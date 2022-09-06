using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlMudLogGeologyInterval : IWitsmlQueryType
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("typeLithology")]
        public string TypeLithology { get; set; }

        [XmlElement("mdTop")]
        public WitsmlIndex MdTop { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlIndex MdBottom { get; set; }

        [XmlElement("lithology")]
        public WitsmlMudLogLithology Lithology { get; set; }

        [XmlElement("commonTime")]
        public WitsmlCommonTime CommonTime { get; set; }

        public string TypeName => "geologyInterval";
    }
}
