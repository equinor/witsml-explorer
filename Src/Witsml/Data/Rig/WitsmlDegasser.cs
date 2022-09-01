using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlDegasser
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("model")]
        public string Model { get; set; }

        [XmlElement("dTimInstall")]
        public string DTimInstall { get; set; }

        [XmlElement("dTimRemove")]
        public string DTimRemove { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("height")]
        public WitsmlLengthMeasure Height { get; set; }

        [XmlElement("len")]
        public WitsmlLengthMeasure Len { get; set; }

        [XmlElement("id")]
        public WitsmlLengthMeasure Id { get; set; }

        [XmlElement("capFlow")]
        public WitsmlFlowRateMeasure CapFlow { get; set; }

        [XmlElement("areaSeparatorFlow")]
        public WitsmlAreaMeasure AreaSeparatorFlow { get; set; }

        [XmlElement("htMudSeal")]
        public WitsmlLengthMeasure HtMudSeal { get; set; }

        [XmlElement("idInlet")]
        public WitsmlLengthMeasure IdInlet { get; set; }

        [XmlElement("idVentLine")]
        public WitsmlLengthMeasure IdVentLine { get; set; }

        [XmlElement("lenVentLine")]
        public WitsmlLengthMeasure LenVentLine { get; set; }

        [XmlElement("capGasSep")]
        public WitsmlFlowRateMeasure CapGasSep { get; set; }

        [XmlElement("capBlowdown")]
        public WitsmlFlowRateMeasure CapBlowdown { get; set; }

        [XmlElement("presRating")]
        public WitsmlPressureMeasure PresRating { get; set; }

        [XmlElement("tempRating")]
        public WitsmlThermodynamicTemperatureMeasure TempRating { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }
    }
}
