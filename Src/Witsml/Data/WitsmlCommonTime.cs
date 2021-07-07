using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlCommonTime
    {
        [XmlElement("dTimCreation")]
        public string DTimCreation { get; set; } = "";

        [XmlElement("dTimLastChange")]
        public string DTimLastChange { get; set; } = "";
    }
}
