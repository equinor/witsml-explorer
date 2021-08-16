using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlBitRecord
    {
        [XmlElement("diaBit")]
        public Measure DiaBit { get; set; }
    }
}
