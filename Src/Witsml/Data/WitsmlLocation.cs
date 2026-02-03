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
        [XmlElement("latitude")] public WitsmlPlaneAngleMeasure Latitude { get; set; }
        [XmlElement("longitude")] public WitsmlPlaneAngleMeasure Longitude { get; set; }
        [XmlElement("easting")] public WitsmlLengthMeasure Easting { get; set; }
        [XmlElement("northing")] public WitsmlLengthMeasure Northing { get; set; }
        [XmlElement("westing")] public WitsmlLengthMeasure Westing { get; set; }
        [XmlElement("southing")] public WitsmlLengthMeasure Southing { get; set; }
        [XmlElement("projectedX")] public WitsmlLengthMeasure ProjectedX { get; set; }
        [XmlElement("projectedY")] public WitsmlLengthMeasure ProjectedY { get; set; }
        [XmlElement("localX")] public WitsmlLengthMeasure LocalX { get; set; }
        [XmlElement("localY")] public WitsmlLengthMeasure LocalY { get; set; }
        [XmlIgnore]
        public bool? Original { get; set; }
        [XmlElement("original")]
        public string OriginalText
        {
            get => Original.HasValue ? XmlConvert.ToString(Original.Value) : null;
            set => Original = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }
        [XmlElement("description")] public string Description { get; set; }

        public static WitsmlLocation ToFetch()
        {
            return new()
            {
                Uid = string.Empty,
                WellCrs = new WitsmlRefNameString
                {
                    UidRef = string.Empty,
                    Value = string.Empty
                },
                Latitude = Measure.ToFetch<WitsmlPlaneAngleMeasure>(),
                Longitude = Measure.ToFetch<WitsmlPlaneAngleMeasure>(),
                Easting = Measure.ToFetch<WitsmlLengthMeasure>(),
                Northing = Measure.ToFetch<WitsmlLengthMeasure>(),
                Westing = Measure.ToFetch<WitsmlLengthMeasure>(),
                Southing = Measure.ToFetch<WitsmlLengthMeasure>(),
                LocalX = Measure.ToFetch<WitsmlLengthMeasure>(),
                LocalY = Measure.ToFetch<WitsmlLengthMeasure>(),
                ProjectedX = Measure.ToFetch<WitsmlLengthMeasure>(),
                ProjectedY = Measure.ToFetch<WitsmlLengthMeasure>()
            };
        }

    }
}
