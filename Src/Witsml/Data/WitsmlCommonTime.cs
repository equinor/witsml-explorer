using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlCommonTime
    {
        [XmlElement("dTimCreation")]
        public string DTimCreation { get; set; } = null;

        [XmlElement("dTimLastChange")]
        public string DTimLastChange { get; set; } = null;
    }
}
