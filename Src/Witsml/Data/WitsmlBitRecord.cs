using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlBitRecord
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("diaBit")]
        public Measure DiaBit { get; set; }
    }
}
