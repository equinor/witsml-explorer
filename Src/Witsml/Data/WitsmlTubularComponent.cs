using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlTubularComponent
    {
        [XmlElement("typeTubularComp")]
        public string TypeTubularComp { get; set; }

        [XmlElement("sequence")]
        public int Sequence { get; set; }

        [XmlElement("id")]
        public Measure Id { get; set; }

        [XmlElement("od")]
        public Measure Od { get; set; }

        [XmlElement("len")]
        public Measure Len { get; set; }

        [XmlElement("lenJointAv")]
        public Measure LenJointAv { get; set; }

        [XmlElement("numJointStand")]
        public string NumJointStand { get; set; }

        [XmlElement("wtPerLen")]
        public Measure WtPerLen { get; set; }

        [XmlElement("tensYield")]
        public Measure TensYield { get; set; }

        [XmlElement("idFishneck")]
        public Measure IdFishneck { get; set; }

        [XmlElement("odFishneck")]
        public Measure OdFishneck { get; set; }

        [XmlElement("configCon")]
        public string ConfigCon { get; set; }

        [XmlElement("vendor")]
        public string Vendor { get; set; }
    }
}
