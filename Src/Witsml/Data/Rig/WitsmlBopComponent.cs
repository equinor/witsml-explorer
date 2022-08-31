using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlBopComponent
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("typeBopComp")]
        public string TypeBopComp { get; set; }

        [XmlElement("descComp")]
        public string DescComp { get; set; }

        [XmlElement("idPassThru")]
        public WitsmlLengthMeasure IdPassThru { get; set; }

        [XmlElement("presWork")]
        public WitsmlPressureMeasure PresWork { get; set; }

        [XmlElement("diaCloseMn")]
        public WitsmlLengthMeasure DiaCloseMn { get; set; }

        [XmlElement("diaCloseMx")]
        public WitsmlLengthMeasure DiaCloseMx { get; set; }

        [XmlElement("nomenclature")]
        public string Nomenclature { get; set; }

        [XmlElement("isVariable")]
        public string IsVariable { get; set; }
    }
}
