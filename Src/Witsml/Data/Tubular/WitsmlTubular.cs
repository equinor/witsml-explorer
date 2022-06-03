using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlTubular
    {
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

        [XmlElement("typeTubularAssy")]
        public string TypeTubularAssy { get; set; }

        [XmlIgnore]
        public bool? ValveFloat { get; set; }
        [XmlElement("valveFloat")]
        public string ValveFloatText
        {
            get { return ValveFloat.HasValue ? XmlConvert.ToString(ValveFloat.Value) : null; }
            set { ValveFloat = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value); }
        }

        [XmlIgnore]
        public bool? SourceNuclear { get; set; }
        [XmlElement("sourceNuclear")]
        public string SourceNuclearText
        {
            get { return SourceNuclear.HasValue ? XmlConvert.ToString(SourceNuclear.Value) : null; }
            set { SourceNuclear = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value); }
        }

        [XmlElement("diaHoleAssy")]
        public Measure DiaHoleAssy { get; set; }

        [XmlElement("tubularComponent")]
        public List<WitsmlTubularComponent> TubularComponents { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

    }
}
