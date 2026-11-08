using System;
using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlReferencePoint
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("elevation")]
        public WitsmlMeasureWithDatum Elevation { get; set; }

        [XmlElement("measuredDepth")]
        public WitsmlMeasureWithDatum MeasuredDepth { get; set; }

        [XmlElement("location")]
        public List<WitsmlLocation> Location { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

        public static WitsmlReferencePoint ToFetch()
        {
            return new()
            {
                Uid = string.Empty,
                Name = string.Empty,
                Location = new List<WitsmlLocation>()
                {
                    WitsmlLocation.ToFetch()
                }
            };
        }
    }
}
