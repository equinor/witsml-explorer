using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;


namespace Witsml.Data
{
    public class WitsmlRisk : WitsmlObjectOnWellbore
    {
        public override WitsmlRisks AsItemInWitsmlList()
        {
            return new WitsmlRisks()
            {
                Risks = this.AsItemInList()
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
        public WitsmlMeasureWithDatum MdHoleStart { get; set; }
        [XmlElement("mdHoleEnd")]
        public WitsmlMeasureWithDatum MdHoleEnd { get; set; }
        [XmlElement("tvdHoleStart")]
        public WitsmlMeasureWithDatum TvdHoleStart { get; set; }
        [XmlElement("tvdHoleEnd")]
        public WitsmlMeasureWithDatum TvdHoleEnd { get; set; }
        [XmlElement("mdBitStart")]
        public WitsmlMeasureWithDatum MdBitStart { get; set; }
        [XmlElement("mdBitEnd")]
        public WitsmlMeasureWithDatum MdBitEnd { get; set; }
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
