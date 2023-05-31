using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlRheometer
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("tempRheom")]
        public WitsmlThermodynamicTemperatureMeasure TempRheom { get; set; }

        [XmlElement("presRheom")]
        public WitsmlPressureMeasure PresRheom { get; set; }

        [XmlElement("vis3Rpm")]
        public string Vis3Rpm { get; set; }

        [XmlElement("vis6Rpm")]
        public string Vis6Rpm { get; set; }

        [XmlElement("vis100Rpm")]
        public string Vis100Rpm { get; set; }

        [XmlElement("vis200Rpm")]
        public string Vis200Rpm { get; set; }

        [XmlElement("vis300Rpm")]
        public string Vis300Rpm { get; set; }

        [XmlElement("vis600Rpm")]
        public string Vis600Rpm { get; set; }
    }
}
