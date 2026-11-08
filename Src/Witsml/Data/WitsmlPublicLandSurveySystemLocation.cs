using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlPublicLandSurveySystemLocation
    {
        [XmlElement("principalMeridian")]
        public string PrincipalMeridian { get; set; }

        [XmlElement("range")]
        public string Range { get; set; }

        [XmlElement("rangeDir")]
        public string RangeDir { get; set; }

        [XmlElement("township")]
        public string Township { get; set; }

        [XmlElement("townshipDir")]
        public string TownshipDir { get; set; }

        [XmlElement("section")]
        public string Section { get; set; }

        [XmlElement("quarterSection")]
        public string QuarterSection { get; set; }

        [XmlElement("quarterTownship")]
        public string QuarterTownship { get; set; }

        [XmlElement("footageNS")]
        public WitsmlFootageMeasure FootageNS { get; set; }

        [XmlElement("footageEW")]
        public WitsmlFootageMeasure FootageEW { get; set; }
    }

    public class WitsmlFootageMeasure : Measure
    {
        [XmlAttribute("ref")]
        public string Ref { get; set; }
    }
}
