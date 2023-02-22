using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlShow
    {
        [XmlElement("showRat")]
        public string ShowRat { get; set; }

        [XmlElement("stainColor")]
        public string StainColor { get; set; }

        [XmlElement("stainDistr")]
        public string StainDistr { get; set; }

        [XmlElement("stainPc")]
        public Measure StainPc { get; set; }

        [XmlElement("natFlorColor")]
        public string NatFlorColor { get; set; }

        [XmlElement("natFlorPc")]
        public Measure NatFlorPc { get; set; }

        [XmlElement("natFlorLevel")]
        public string NatFlorLevel { get; set; }

        [XmlElement("natFlorDesc")]
        public string NatFlorDesc { get; set; }

        [XmlElement("cutColor")]
        public string CutColor { get; set; }

        [XmlElement("cutSpeed")]
        public string CutSpeed { get; set; }

        [XmlElement("cutStrength")]
        public string CutStrength { get; set; }

        [XmlElement("cutForm")]
        public string CutForm { get; set; }

        [XmlElement("cutLevel")]
        public string CutLevel { get; set; }

        [XmlElement("cutFlorColor")]
        public string CutFlorColor { get; set; }

        [XmlElement("cutFlorSpeed")]
        public string CutFlorSpeed { get; set; }

        [XmlElement("cutFlorStrength")]
        public string CutFlorStrength { get; set; }

        [XmlElement("cutFlorForm")]
        public string CutFlorForm { get; set; }

        [XmlElement("cutFlorLevel")]
        public string CutFlorLevel { get; set; }

        [XmlElement("residueColor")]
        public string ResidueColor { get; set; }

        [XmlElement("showDesc")]
        public string ShowDesc { get; set; }

        [XmlElement("impregnatedLitho")]
        public string ImpregnatedLitho { get; set; }

        [XmlElement("odor")]
        public string Odor { get; set; }
    }
}


