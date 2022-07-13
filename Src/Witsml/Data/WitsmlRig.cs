using System.Xml.Serialization;
using Witsml.Data.Measures;
using System.Xml;
namespace Witsml.Data
{
    public class WitsmlRig
    {
        [XmlElement("airGap")]
        public WitsmlLengthMeasure AirGap { get; set; }
        [XmlElement("approvals")]
        public string Approvals { get; set; }

        [XmlElement("name")]
        public string Name { get; set; } = "";

        [XmlElement("nameWell")]
        public string NameWell { get; set; } = "";

        [XmlElement("nameWellbore")]
        public string NameWellbore { get; set; } = "";

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("typeRig")]
        public string TypeRig { get; set; }

        [XmlElement("dTimStartOp")]
        public string DTimStartOp { get; set; }

        [XmlElement("dTimEndOp")]
        public string DTimEndOp { get; set; }
        [XmlElement("classRig")]
        public string ClassRig { get; set; }

        [XmlElement("emailAddress")]
        public string EmailAddress { get; set; }

        [XmlElement("faxNumber")]
        public string FaxNumber { get; set; }

        [XmlIgnore]
        public bool? IsOffshore { get; set; }
        [XmlElement("isOffshore")]
        public string IsOffshoreText
        {
            get { return IsOffshore.HasValue ? XmlConvert.ToString(IsOffshore.Value) : null; }
            set { IsOffshore = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value); }
        }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("nameContact")]
        public string NameContact { get; set; }

        [XmlElement("ratingDrillDepth")]
        public WitsmlLengthMeasure RatingDrillDepth { get; set; }

        [XmlElement("ratingWaterDepth")]
        public WitsmlLengthMeasure RatingWaterDepth { get; set; }

        [XmlElement("registration")]
        public string Registration { get; set; }

        [XmlElement("telNumber")]
        public string TelNumber { get; set; }

        [XmlElement("yearEntService")]
        public string YearEntService { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; } = "";

        [XmlAttribute("uidWell")]
        public string UidWell { get; set; } = "";

        [XmlAttribute("uidWellbore")]
        public string UidWellbore { get; set; } = "";
    }
}
