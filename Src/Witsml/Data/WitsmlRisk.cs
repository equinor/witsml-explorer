using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;


namespace Witsml.Data
{
    public class WitsmlRisk : ObjectOnWellbore<WitsmlRisks>
    {
        public override WitsmlRisks AsSingletonWitsmlList()
        {
            return new WitsmlRisks()
            {
                Risks = this.AsSingletonList()
            };
        }
        [XmlElement("objectReference")]
        public WitsmlObjectReference ObjectReference { get; set; }
        [XmlElement("type")]
        public string Type { get; set; }
        [XmlElement("category")]
        public string Category { get; set; }
        [XmlElement("subCategory")]
        public string SubCategory { get; set; }
        [XmlElement("extendCategory")]
        public string ExtendCategory { get; set; }
        [XmlElement("affectedPersonnel")]
        public string[] AffectedPersonnel { get; set; }
        [XmlElement("dTimStart")]
        public string DTimStart { get; set; }
        [XmlElement("dTimEnd")]
        public string DTimEnd { get; set; }
        [XmlElement("mdHoleStart")]
        public WitsmlMeasuredDepthCoord MdHoleStart { get; set; }
        [XmlElement("mdHoleEnd")]
        public WitsmlMeasuredDepthCoord MdHoleEnd { get; set; }
        [XmlElement("tvdHoleStart")]
        public WitsmlWellVerticalDepthCoord TvdHoleStart { get; set; }
        [XmlElement("tvdHoleEnd")]
        public WitsmlWellVerticalDepthCoord TvdHoleEnd { get; set; }
        [XmlElement("mdBitStart")]
        public WitsmlMeasuredDepthCoord MdBitStart { get; set; }
        [XmlElement("mdBitEnd")]
        public WitsmlMeasuredDepthCoord MdBitEnd { get; set; }
        [XmlElement("diaHole")]
        public WitsmlLengthMeasure DiaHole { get; set; }
        [XmlElement("severityLevel")]
        public string SeverityLevel { get; set; }
        [XmlElement("probabilityLevel")]
        public string ProbabilityLevel { get; set; }
        [XmlElement("summary")]
        public string Summary { get; set; }
        [XmlElement("details")]
        public string Details { get; set; }
        [XmlElement("identification")]
        public string Identification { get; set; }
        [XmlElement("contingency")]
        public string Contingency { get; set; }
        [XmlElement("mitigation")]
        public string Mitigation { get; set; }
        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

    }
}
