using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlPump
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("index")]
        public string Index { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("model")]
        public string Model { get; set; }

        [XmlElement("dTimInstall")]
        public string DTimInstall { get; set; }

        [XmlElement("dTimRemove")]
        public string DTimRemove { get; set; }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("typePump")]
        public string TypePump { get; set; }

        [XmlElement("numCyl")]
        public string NumCyl { get; set; }

        [XmlElement("odRod")]
        public WitsmlLengthMeasure OdRod { get; set; }

        [XmlElement("idLiner")]
        public WitsmlLengthMeasure IdLiner { get; set; }

        [XmlElement("pumpAction")]
        public string PumpAction { get; set; }

        [XmlElement("eff")]
        public WitsmlRelativePowerMeasure Eff { get; set; }

        [XmlElement("lenStroke")]
        public WitsmlLengthMeasure LenStroke { get; set; }

        [XmlElement("presMx")]
        public WitsmlPressureMeasure PresMx { get; set; }

        [XmlElement("powHydMx")]
        public WitsmlPowerMeasure PowHydMx { get; set; }

        [XmlElement("spmMx")]
        public WitsmlAnglePerTimeMeasure SpmMx { get; set; }

        [XmlElement("displacement")]
        public WitsmlVolumeMeasure Displacement { get; set; }

        [XmlElement("presDamp")]
        public WitsmlPressureMeasure PresDamp { get; set; }

        [XmlElement("volDamp")]
        public WitsmlVolumeMeasure VolDamp { get; set; }

        [XmlElement("powMechMx")]
        public WitsmlPowerMeasure PowMechMx { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }
    }
}
