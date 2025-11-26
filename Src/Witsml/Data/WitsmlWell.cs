using System;
using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlWellDatum
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }
        [XmlElement("name")]
        public string Name { get; set; }
        [XmlElement("code")]
        public string Code { get; set; }
        [XmlElement("elevation")]
        public WitsmlMeasureWithDatum Elevation { get; set; }

        public static WitsmlWellDatum ToFetch()
        {
            return new()
            {
                Uid = string.Empty,
                Name = string.Empty,
                Code = string.Empty,
                Elevation = WitsmlMeasureWithDatum.ToFetch()
            };
        }
    }

    public class WitsmlWell
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("field")]
        public string Field { get; set; }

        [XmlElement("country")]
        public string Country { get; set; }

        [XmlElement("region")]
        public string Region { get; set; }

        [XmlElement("timeZone")]
        public string TimeZone { get; set; }

        [XmlElement("operator")]
        public string Operator { get; set; }

        [XmlElement("numLicense")]
        public string NumLicense { get; set; }

        [XmlElement("statusWell")]
        public string StatusWell { get; set; }

        [XmlElement("purposeWell")]
        public string PurposeWell { get; set; }

        [XmlElement("wellDatum")]
        public List<WitsmlWellDatum> WellDatum { get; set; }

        [XmlElement("waterDepth")]
        public WitsmlLengthMeasure WaterDepth { get; set; }

        [XmlElement("wellLocation")]
        public List<WitsmlLocation> WellLocation { get; set; }

        [XmlElement("referencePoint")]
        public List<WitsmlReferencePoint> ReferencePoint { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
