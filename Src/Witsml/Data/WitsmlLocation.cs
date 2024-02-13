using System.Globalization;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlLocation
    {
        [XmlAttribute("uid")] public string Uid { get; set; }
        [XmlElement("wellCRS")] public WitsmlRefNameString WellCrs { get; set; }
        [XmlElement("latitude")] public Measure Latitude { get; set; }
        [XmlElement("longitude")] public Measure Longitude { get; set; }
        [XmlElement("easting")] public Measure Easting { get; set; }
        [XmlElement("northing")] public Measure Northing { get; set; }
        [XmlElement("westing")] public Measure Westing { get; set; }
        [XmlElement("southing")] public Measure Southing { get; set; }
        [XmlElement("projectedX")] public Measure ProjectedX { get; set; }
        [XmlElement("projectedY")] public Measure ProjectedY { get; set; }
        [XmlElement("localX")] public Measure LocalX { get; set; }
        [XmlElement("localY")] public Measure LocalY { get; set; }
        [XmlIgnore]
        public bool? Original { get; set; }
        [XmlElement("original")]
        public string OriginalText
        {
            get => Original.HasValue ? XmlConvert.ToString(Original.Value) : null;
            set => Original = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }
        [XmlElement("description")] public string Description { get; set; }

    }
}
