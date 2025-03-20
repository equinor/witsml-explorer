import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridIndexedObjectProperties } from "templates/dataGrid/objects/common/properties/DataGridIndexedObjectProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellKnownNameStructProperties } from "templates/dataGrid/objects/common/properties/DataGridWellKnownNameStructProperties";

export const dataGridWellCRSProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "The unique identifier of the system.",
    isAttribute: true
  },
  {
    name: "name",
    documentation:
      "Human recognizable context for the system. For a geodetic system this is commonly the name of the datum."
  },
  {
    name: "mapProjection",
    documentation:
      "Map projection system. Note that these structures do not truly define a CRS but rather specify information that could be used to describe a CRS.",
    isContainer: true,
    properties: [
      {
        name: "nameCRS",
        documentation:
          "The name of the coordinate reference system in a particular naming system. An optional short name (code) can also be specified. Specifying a well known system is highly desired. An example would be to specify a name of 'WGS 84 / UTM zone 10N' with a code of '32610' in the 'EPSG' naming system. Note that specifying a name in the EPSG naming system is asserting that the parameters in the EPSG database are appropriate for this CRS. This is also true for any other naming system. If in doubt, contact your local geodesist.",
        properties: dataGridWellKnownNameStructProperties
      },
      {
        name: "projectionCode",
        documentation: "DEPRECATED. A code to identify the type of projection."
      },
      {
        name: "projectedFrom",
        documentation:
          "DEPRECATED. A pointer to the wellCRS that represents the geographic system from which this system was projected.",
        properties: dataGridRefNameStringProperties
      },
      {
        name: "stdParallel1",
        documentation: "DEPRECATED. Latitude of first standard parallel.",
        properties: dataGridUomProperties
      },
      {
        name: "stdParallel2",
        documentation:
          "DEPRECATED. Latitude of second standard parallel, if used.",
        properties: dataGridUomProperties
      },
      {
        name: "centralMeridian",
        documentation:
          "DEPRECATED. Longitude of the Y axis of the resulting map.",
        properties: dataGridUomProperties
      },
      {
        name: "originLatitude",
        documentation:
          "DEPRECATED. Latitude at which the X axis intersects the central meridian.",
        properties: dataGridUomProperties
      },
      {
        name: "originLongitude",
        documentation: "DEPRECATED. Longitude of the central meridian.",
        properties: dataGridUomProperties
      },
      {
        name: "latitude1",
        documentation:
          "DEPRECATED. Latitude of the first point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties
      },
      {
        name: "longitude1",
        documentation:
          "DEPRECATED. Longitude of the first point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties
      },
      {
        name: "latitude2",
        documentation:
          "DEPRECATED. Latitude of the second point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties
      },
      {
        name: "longitude2",
        documentation:
          "DEPRECATED. Longitude of the second point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties
      },
      {
        name: "latitudeForScale",
        documentation:
          "DEPRECATED. Latitude of a point for which the scale factor is specified exactly. Default to origin.",
        properties: dataGridUomProperties
      },
      {
        name: "longitudeForScale",
        documentation:
          "DEPRECATED. Longitude of a point for which the scale factor is specified exactly. Default to origin.",
        properties: dataGridUomProperties
      },
      {
        name: "trueScaleLatitude",
        documentation:
          "DEPRECATED. Latitude at which the scale on the map is exact. If none is provided, scale is assumed to be exact at the equator.",
        properties: dataGridUomProperties
      },
      {
        name: "spheroidRadius",
        documentation: "DEPRECATED. Spheroid radius.",
        properties: dataGridUomProperties
      },
      {
        name: "scaleFactor",
        documentation: "DEPRECATED. Ellipsoid scale factor."
      },
      {
        name: "methodVariant",
        documentation:
          "DEPRECATED. Projection method variant - establishes minor variations of the projection. Geoshare proposal."
      },
      {
        name: "perspectiveHeight",
        documentation:
          "DEPRECATED. Height above the surface origin location from which the perspective is taken.",
        properties: dataGridUomProperties
      },
      {
        name: "zone",
        documentation:
          'DEPRECATED. Zone for the type of projection. Zones have values from 1 to 60 with a required direction of "N" (North) or "S" (South). For example, "21N".'
      },
      {
        name: "NADType",
        documentation: "DEPRECATED. North American Datum type."
      },
      {
        name: "falseEasting",
        documentation: "DEPRECATED. Artificial value added to the X axis.",
        properties: dataGridUomProperties
      },
      {
        name: "falseNorthing",
        documentation: "DEPRECATED. Artificial value added to the Y axis.",
        properties: dataGridUomProperties
      },
      {
        name: "bearing",
        documentation:
          "DEPRECATED. Bearing angle of the great circle with respect to north at the central point.",
        properties: dataGridUomProperties
      },
      {
        name: "hemisphere",
        documentation:
          "DEPRECATED. Is the projection in the northern hemisphere or the southern hemisphere."
      },
      {
        name: "description",
        documentation: "DEPRECATED. Description of item and details."
      },
      {
        name: "parameter",
        documentation:
          "DEPRECATED. Parameter describing the user-defined projection. For this usage the name attribute MUST be specified because it represents the meaning of the data. While the index attribute is mandatory, it is only significant if the same name repeats.",
        isContainer: true,
        isMultiple: true,
        properties: dataGridIndexedObjectProperties
      }
    ]
  },
  {
    name: "geographic",
    documentation:
      "Geographic system. Note that these structures do not truly define a CRS but rather specify information that could be used to describe a CRS.",
    isContainer: true,
    properties: [
      {
        name: "nameCRS",
        documentation:
          "The name of the coordinate reference system in a particular naming system. An optional short name (code) can also be specified. Specifying a well known system is highly desired. An example would be to specify a name of 'ED50' with a code of '4230' in the 'EPSG' naming system. Note that specifying a name in the EPSG naming system is asserting that the parameters in the EPSG database are appropriate for this CRS. This is also true for any other naming system. If in doubt, contact your local geodesist.",
        properties: dataGridWellKnownNameStructProperties
      },
      {
        name: "geodeticDatumCode",
        documentation:
          "DEPRECATED. Geodetic datum code. This defines a system in the Geoshare naming system and should probably not be used with CRSName."
      },
      {
        name: "xTranslation",
        documentation:
          "DEPRECATED. Ellipsoid translation (3). Units are meters by convention.",
        properties: dataGridUomProperties
      },
      {
        name: "yTranslation",
        documentation:
          "DEPRECATED. Ellipsoid translation (3). Units are meters by convention.",
        properties: dataGridUomProperties
      },
      {
        name: "zTranslation",
        documentation:
          "DEPRECATED. Ellipsoid translation (3). Units are meters by convention.",
        properties: dataGridUomProperties
      },
      {
        name: "xRotation",
        documentation:
          "DEPRECATED. Ellipsoid rotation (3). Seconds of arc by convention.",
        properties: dataGridUomProperties
      },
      {
        name: "yRotation",
        documentation:
          "DEPRECATED. Ellipsoid rotation (3). Seconds of arc by convention.",
        properties: dataGridUomProperties
      },
      {
        name: "zRotation",
        documentation:
          "DEPRECATED. Ellipsoid rotation (3). Seconds of arc by convention.",
        properties: dataGridUomProperties
      },
      {
        name: "scaleFactor",
        documentation: "DEPRECATED. Ellipsoid scale factor."
      },
      {
        name: "ellipsoidCode",
        documentation:
          "DEPRECATED. Ellipsoid code (spheroid) defining geographic or planar coordinates. Implied if geodeticDatumCode is specified (and is not user defined)."
      },
      {
        name: "ellipsoidSemiMajorAxis",
        documentation:
          "DEPRECATED. Ellipsoid semi-major axis size. Implied if geodeticDatumCode or ellipsoidCode specified.",
        properties: dataGridUomProperties
      },
      {
        name: "ellipsoidInverseFlattening",
        documentation:
          "DEPRECATED. Ellipsoid inverse flattening value (ie. 1/x). Implied if geodeticDatumCode or ellipsoidCode specified."
      }
    ]
  },
  {
    name: "mapProjectionCRS",
    documentation:
      "A reference to the coordinateReferenceSystems object representing the Map projection system.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "geodeticCRS",
    documentation:
      "A reference to the coordinateReferenceSystems object representing the Geodetic (i.e., Geocentric or Geographic) system.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "localCRS",
    documentation:
      "Local (engineering) system. Note that these structures do not truly define a CRS but rather specify information that could be used to describe a CRS.",
    isContainer: true,
    properties: [
      {
        name: "usesWellAsOrigin",
        documentation:
          'True ("true" or "1") indicates that the well surface point is the origin of this CRS. False ("false" or "0") or not given indicates otherwise.'
      },
      {
        name: "origin",
        documentation:
          "A pointer to the well reference point that is the origin of this CRS.",
        properties: dataGridRefNameStringProperties
      },
      {
        name: "originDescription",
        documentation: "A textual description of the origin."
      },
      {
        name: "yAxisAzimuth",
        documentation:
          "The angle of the Y axis from North (as described in attribute northDirection). Defaults to zero. Positive clockwise.",
        properties: [
          {
            name: "uom",
            documentation: "The unit of measure of the azimuth value.",
            isAttribute: true
          },
          {
            name: "northDirection",
            documentation:
              "Specifies the direction to be considered North for the y axis.",
            isAttribute: true
          }
        ]
      },
      {
        name: "magneticDeclination",
        documentation:
          "The angle between magnetic north and true north. The angle is measured positive clockwise from true north to magnetic north. This value SHOULD be given if the yAxisAzimuth is measured from the magnetic north direction.",
        properties: dataGridUomProperties
      },
      {
        name: "gridConvergence",
        documentation:
          "The angle between true north and the northing axis or the projection grid being used. The angle is measured at the point in question, and is measured from true north to grid north, positive clockwise.",
        properties: dataGridUomProperties
      },
      {
        name: "yAxisDescription",
        documentation:
          "A free-form description of the Y axis. Examples would be 'parallel to the west side of the platform', or 'along the main entry road'."
      },
      {
        name: "xRotationCounterClockwise",
        documentation:
          'True ("true" or "1") indicates that the X axis is rotated counter-clockwise from the Y axis when viewed from above the earth looking down. False ("false" or "0") or not given indicates a clockwise rotation. Generally the X axis is rotated clockwise.'
      }
    ]
  },
  {
    name: "description",
    documentation: "A textual description of the system."
  },
  dataGridExtensionNameValue
];
