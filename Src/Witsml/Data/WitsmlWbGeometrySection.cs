using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlWbGeometrySection
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("typeHoleCasing")]
        public string TypeHoleCasing { get; set; }

        [XmlElement("mdTop")]
        public WitsmlMeasuredDepthCoord MdTop { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasuredDepthCoord MdBottom { get; set; }

        [XmlElement("tvdTop")]
        public WitsmlWellVerticalDepthCoord TvdTop { get; set; }

        [XmlElement("tvdBottom")]
        public WitsmlWellVerticalDepthCoord TvdBottom { get; set; }

        [XmlElement("idSection")]
        public WitsmlLengthMeasure IdSection { get; set; }

        [XmlElement("odSection")]
        public WitsmlLengthMeasure OdSection { get; set; }

        [XmlElement("wtPerLen")]
        public WitsmlMassPerLengthMeasure WtPerLen { get; set; }

        [XmlElement("grade")]
        public string Grade { get; set; }

        [XmlElement("curveConductor")]
        public string CurveConductor { get; set; }

        [XmlElement("diaDrift")]
        public WitsmlLengthMeasure DiaDrift { get; set; }

        [XmlElement("factFric")]
        public string FactFric { get; set; }

    }
}
