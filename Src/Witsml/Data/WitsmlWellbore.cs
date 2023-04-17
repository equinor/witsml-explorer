using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlWellbore
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("nameWell")]
        public string NameWell { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlAttribute("uidWell")]
        public string UidWell { get; set; }

        [XmlElement("number")]
        public string Number { get; set; }

        [XmlElement("suffixAPI")]
        public string SuffixAPI { get; set; }

        [XmlElement("numGovt")]
        public string NumGovt { get; set; }

        [XmlElement("parentWellbore")]
        public WitsmlParentWellbore ParentWellbore { get; set; }

        [XmlElement("statusWellbore")]
        public string StatusWellbore { get; set; }

        [XmlElement("isActive")]
        public string IsActive { get; set; }

        [XmlElement("purposeWellbore")]
        public string PurposeWellbore { get; set; }

        [XmlElement("typeWellbore")]
        public string TypeWellbore { get; set; }

        [XmlElement("shape")]
        public string Shape { get; set; }

        [XmlElement("dTimKickoff")]
        public string DTimKickoff { get; set; }

        [XmlElement("md")]
        public WitsmlMeasuredDepthCoord Md { get; set; }

        [XmlElement("tvd")]
        public WitsmlWellVerticalDepthCoord Tvd { get; set; }

        [XmlElement("mdKickoff")]
        public WitsmlMeasuredDepthCoord MdKickoff { get; set; }

        [XmlElement("tvdKickoff")]
        public WitsmlWellVerticalDepthCoord TvdKickoff { get; set; }

        [XmlElement("mdPlanned")]
        public WitsmlMeasuredDepthCoord MdPlanned { get; set; }

        [XmlElement("tvdPlanned")]
        public WitsmlWellVerticalDepthCoord TvdPlanned { get; set; }

        [XmlElement("mdSubSeaPlanned")]
        public WitsmlMeasuredDepthCoord MdSubSeaPlanned { get; set; }

        [XmlElement("tvdSubSeaPlanned")]
        public WitsmlWellVerticalDepthCoord TvdSubSeaPlanned { get; set; }

        [XmlElement("dayTarget")]
        public WitsmlDayMeasure DayTarget { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
