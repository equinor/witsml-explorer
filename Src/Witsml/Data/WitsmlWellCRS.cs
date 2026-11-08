using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlWellCRS
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("mapProjection")]
        public WitsmlMapProjection MapProjection { get; set; }

        [XmlElement("geographic")]
        public WitsmlGeographic Geographic { get; set; }

        [XmlElement("mapProjectionCRS")]
        public WitsmlRefNameString MapProjectionCRS { get; set; }

        [XmlElement("geodeticCRS")]
        public WitsmlRefNameString GeodeticCRS { get; set; }

        [XmlElement("localCRS")]
        public WitsmlLocalCRS LocalCRS { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
    }

    public class WitsmlMapProjection
    {
        [XmlElement("nameCRS")]
        public WitsmlRefNameString NameCRS { get; set; }

        [XmlElement("projectionCode")]
        public string ProjectionCode { get; set; }

        [XmlElement("projectedFrom")]
        public WitsmlRefNameString ProjectedFrom { get; set; }

        [XmlElement("stdParallel1")]
        public WitsmlPlaneAngleMeasure StdParallel1 { get; set; }

        [XmlElement("stdParallel2")]
        public WitsmlPlaneAngleMeasure StdParallel2 { get; set; }

        [XmlElement("centralMeridian")]
        public WitsmlPlaneAngleMeasure CentralMeridian { get; set; }

        [XmlElement("originLatitude")]
        public WitsmlPlaneAngleMeasure OriginLatitude { get; set; }

        [XmlElement("originLongitude")]
        public WitsmlPlaneAngleMeasure OriginLongitude { get; set; }

        [XmlElement("latitude1")]
        public WitsmlPlaneAngleMeasure Latitude1 { get; set; }

        [XmlElement("longitude1")]
        public WitsmlPlaneAngleMeasure Longitude1 { get; set; }

        [XmlElement("latitude2")]
        public WitsmlPlaneAngleMeasure Latitude2 { get; set; }

        [XmlElement("longitude2")]
        public WitsmlPlaneAngleMeasure Longitude2 { get; set; }

        [XmlElement("latitudeForScale")]
        public WitsmlPlaneAngleMeasure LatitudeForScale { get; set; }

        [XmlElement("longitudeForScale")]
        public WitsmlPlaneAngleMeasure LongitudeForScale { get; set; }

        [XmlElement("trueScaleLatitude")]
        public WitsmlPlaneAngleMeasure TrueScaleLatitude { get; set; }

        [XmlElement("spheroidRadius")]
        public WitsmlLengthMeasure SpheroidRadius { get; set; }

        [XmlElement("scaleFactor")]
        public string ScaleFactor { get; set; }

        [XmlElement("methodVariant")]
        public string MethodVariant { get; set; }

        [XmlElement("perspectiveHeight")]
        public WitsmlLengthMeasure PerspectiveHeight { get; set; }

        [XmlElement("zone")]
        public string Zone { get; set; }

        [XmlElement("NADType")]
        public string NADType { get; set; }

        [XmlElement("falseEasting")]
        public WitsmlLengthMeasure FalseEasting { get; set; }

        [XmlElement("falseNorthing")]
        public WitsmlLengthMeasure FalseNorthing { get; set; }

        [XmlElement("bearing")]
        public WitsmlPlaneAngleMeasure Bearing { get; set; }

        [XmlElement("hemisphere")]
        public string Hemisphere { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("parameter")]
        public List<WitsmlProjectionParameter> Parameters { get; set; }
    }

    public class WitsmlProjectionParameter
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlAttribute("index")]
        public string Index { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }

        [XmlAttribute("uom")]
        public string Uom { get; set; }

        [XmlAttribute("description")]
        public string Description { get; set; }

        [XmlText]
        public string Value { get; set; }
    }

    public class WitsmlGeographic
    {
        [XmlElement("nameCRS")]
        public WitsmlRefNameString NameCRS { get; set; }

        [XmlElement("geodeticDatumCode")]
        public string GeodeticDatumCode { get; set; }

        [XmlElement("xTranslation")]
        public WitsmlLengthMeasure XTranslation { get; set; }

        [XmlElement("yTranslation")]
        public WitsmlLengthMeasure YTranslation { get; set; }

        [XmlElement("zTranslation")]
        public WitsmlLengthMeasure ZTranslation { get; set; }

        [XmlElement("xRotation")]
        public WitsmlPlaneAngleMeasure XRotation { get; set; }

        [XmlElement("yRotation")]
        public WitsmlPlaneAngleMeasure YRotation { get; set; }

        [XmlElement("zRotation")]
        public WitsmlPlaneAngleMeasure ZRotation { get; set; }

        [XmlElement("scaleFactor")]
        public string ScaleFactor { get; set; }

        [XmlElement("ellipsoidCode")]
        public string EllipsoidCode { get; set; }

        [XmlElement("ellipsoidSemiMajorAxis")]
        public WitsmlLengthMeasure EllipsoidSemiMajorAxis { get; set; }

        [XmlElement("ellipsoidInverseFlattening")]
        public string EllipsoidInverseFlattening { get; set; }
    }

    public class WitsmlLocalCRS
    {
        [XmlElement("usesWellAsOrigin")]
        public string UsesWellAsOrigin { get; set; }

        [XmlElement("origin")]
        public WitsmlRefNameString Origin { get; set; }

        [XmlElement("originDescription")]
        public string OriginDescription { get; set; }

        [XmlElement("yAxisAzimuth")]
        public WitsmlYAxisAzimuth YAxisAzimuth { get; set; }

        [XmlElement("magneticDeclination")]
        public WitsmlPlaneAngleMeasure MagneticDeclination { get; set; }

        [XmlElement("gridConvergence")]
        public WitsmlPlaneAngleMeasure GridConvergence { get; set; }

        [XmlElement("yAxisDescription")]
        public string YAxisDescription { get; set; }

        [XmlElement("xRotationCounterClockwise")]
        public string XRotationCounterClockwise { get; set; }
    }

    public class WitsmlYAxisAzimuth : Measure
    {
        [XmlAttribute("northDirection")]
        public string NorthDirection { get; set; }
    }
}
