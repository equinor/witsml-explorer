import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridIndexedObjectProperties } from "templates/dataGrid/objects/common/properties/DataGridIndexedObjectProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellKnownNameStructProperties } from "templates/dataGrid/objects/common/properties/DataGridWellKnownNameStructProperties";

export const dataGridWellCRSProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "The unique identifier of the system.",
    isAttribute: true
  },
  {
    name: "name",
    required: true,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation:
      "Human recognizable context for the system. For a geodetic system this is commonly the name of the datum."
  },
  {
    name: "mapProjection",
    required: false,
    witsmlType: "cs_projectionx",
    documentation:
      "Map projection system. Note that these structures do not truly define a CRS but rather specify information that could be used to describe a CRS.",
    isContainer: true,
    properties: [
      {
        name: "nameCRS",
        required: false,
        witsmlType: "wellKnownNameStruct",
        documentation:
          "The name of the coordinate reference system in a particular naming system. An optional short name (code) can also be specified. Specifying a well known system is highly desired. An example would be to specify a name of 'WGS 84 / UTM zone 10N' with a code of '32610' in the 'EPSG' naming system. Note that specifying a name in the EPSG naming system is asserting that the parameters in the EPSG database are appropriate for this CRS. This is also true for any other naming system. If in doubt, contact your local geodesist.",
        isContainer: true,
        properties: dataGridWellKnownNameStructProperties
      },
      {
        name: "projectionCode",
        required: false,
        baseType: "string",
        witsmlType: "projection",
        documentation: "DEPRECATED. A code to identify the type of projection."
      },
      {
        name: "projectedFrom",
        required: false,
        baseType: "string",
        witsmlType: "refNameString",
        maxLength: 64,
        documentation:
          "DEPRECATED. A pointer to the wellCRS that represents the geographic system from which this system was projected.",
        properties: dataGridRefNameStringProperties
      },
      {
        name: "stdParallel1",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation: "DEPRECATED. Latitude of first standard parallel.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "stdParallel2",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Latitude of second standard parallel, if used.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "centralMeridian",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Longitude of the Y axis of the resulting map.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "originLatitude",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Latitude at which the X axis intersects the central meridian.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "originLongitude",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation: "DEPRECATED. Longitude of the central meridian.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "latitude1",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Latitude of the first point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "longitude1",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Longitude of the first point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "latitude2",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Latitude of the second point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "longitude2",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Longitude of the second point if the two-point specification of the central line is used.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "latitudeForScale",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Latitude of a point for which the scale factor is specified exactly. Default to origin.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "longitudeForScale",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Longitude of a point for which the scale factor is specified exactly. Default to origin.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "trueScaleLatitude",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Latitude at which the scale on the map is exact. If none is provided, scale is assumed to be exact at the equator.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "spheroidRadius",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "DEPRECATED. Spheroid radius.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "scaleFactor",
        required: false,
        baseType: "double",
        witsmlType: "unitlessQuantity",
        documentation: "DEPRECATED. Ellipsoid scale factor."
      },
      {
        name: "methodVariant",
        required: false,
        baseType: "string",
        witsmlType: "projectionVariantsObliqueMercator",
        documentation:
          "DEPRECATED. Projection method variant - establishes minor variations of the projection. Geoshare proposal."
      },
      {
        name: "perspectiveHeight",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation:
          "DEPRECATED. Height above the surface origin location from which the perspective is taken.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "zone",
        required: false,
        baseType: "string",
        witsmlType: "geodeticZoneString",
        maxLength: 3,
        documentation:
          'DEPRECATED. Zone for the type of projection. Zones have values from 1 to 60 with a required direction of "N" (North) or "S" (South). For example, "21N".'
      },
      {
        name: "NADType",
        required: false,
        baseType: "string",
        witsmlType: "nadTypes",
        documentation: "DEPRECATED. North American Datum type."
      },
      {
        name: "falseEasting",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "DEPRECATED. Artificial value added to the X axis.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "falseNorthing",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "DEPRECATED. Artificial value added to the Y axis.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "bearing",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Bearing angle of the great circle with respect to north at the central point.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "hemisphere",
        required: false,
        baseType: "string",
        witsmlType: "hemispheres",
        documentation:
          "DEPRECATED. Is the projection in the northern hemisphere or the southern hemisphere."
      },
      {
        name: "description",
        required: false,
        baseType: "string",
        witsmlType: "commentString",
        maxLength: 4000,
        documentation: "DEPRECATED. Description of item and details."
      },
      {
        name: "parameter",
        required: false,
        witsmlType: "indexedObject",
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
    required: false,
    witsmlType: "cs_geodeticModel",
    documentation:
      "Geographic system. Note that these structures do not truly define a CRS but rather specify information that could be used to describe a CRS.",
    isContainer: true,
    properties: [
      {
        name: "nameCRS",
        required: false,
        witsmlType: "wellKnownNameStruct",
        documentation:
          "The name of the coordinate reference system in a particular naming system. An optional short name (code) can also be specified. Specifying a well known system is highly desired. An example would be to specify a name of 'ED50' with a code of '4230' in the 'EPSG' naming system. Note that specifying a name in the EPSG naming system is asserting that the parameters in the EPSG database are appropriate for this CRS. This is also true for any other naming system. If in doubt, contact your local geodesist.",
        isContainer: true,
        properties: dataGridWellKnownNameStructProperties
      },
      {
        name: "geodeticDatumCode",
        required: false,
        baseType: "string",
        witsmlType: "geodeticDatum",
        documentation:
          "DEPRECATED. Geodetic datum code. This defines a system in the Geoshare naming system and should probably not be used with CRSName."
      },
      {
        name: "xTranslation",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation:
          "DEPRECATED. Ellipsoid translation (3). Units are meters by convention.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "yTranslation",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation:
          "DEPRECATED. Ellipsoid translation (3). Units are meters by convention.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "zTranslation",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation:
          "DEPRECATED. Ellipsoid translation (3). Units are meters by convention.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "xRotation",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Ellipsoid rotation (3). Seconds of arc by convention.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "yRotation",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Ellipsoid rotation (3). Seconds of arc by convention.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "zRotation",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED. Ellipsoid rotation (3). Seconds of arc by convention.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "scaleFactor",
        required: false,
        baseType: "double",
        witsmlType: "unitlessQuantity",
        documentation: "DEPRECATED. Ellipsoid scale factor."
      },
      {
        name: "ellipsoidCode",
        required: false,
        baseType: "string",
        witsmlType: "ellipsoid",
        documentation:
          "DEPRECATED. Ellipsoid code (spheroid) defining geographic or planar coordinates. Implied if geodeticDatumCode is specified (and is not user defined)."
      },
      {
        name: "ellipsoidSemiMajorAxis",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation:
          "DEPRECATED. Ellipsoid semi-major axis size. Implied if geodeticDatumCode or ellipsoidCode specified.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "ellipsoidInverseFlattening",
        required: false,
        baseType: "double",
        witsmlType: "unitlessQuantity",
        documentation:
          "DEPRECATED. Ellipsoid inverse flattening value (ie. 1/x). Implied if geodeticDatumCode or ellipsoidCode specified."
      }
    ]
  },
  {
    name: "mapProjectionCRS",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "A reference to the coordinateReferenceSystems object representing the Map projection system.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "geodeticCRS",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "A reference to the coordinateReferenceSystems object representing the Geodetic (i.e., Geocentric or Geographic) system.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "localCRS",
    required: false,
    witsmlType: "cs_localCRS",
    documentation:
      "Local (engineering) system. Note that these structures do not truly define a CRS but rather specify information that could be used to describe a CRS.",
    isContainer: true,
    properties: [
      {
        name: "usesWellAsOrigin",
        required: false,
        baseType: "boolean",
        witsmlType: "logicalBoolean",
        documentation:
          'True ("true" or "1") indicates that the well surface point is the origin of this CRS. False ("false" or "0") or not given indicates otherwise.'
      },
      {
        name: "origin",
        required: false,
        baseType: "string",
        witsmlType: "refNameString",
        maxLength: 64,
        documentation:
          "A pointer to the well reference point that is the origin of this CRS.",
        properties: dataGridRefNameStringProperties
      },
      {
        name: "originDescription",
        required: false,
        baseType: "string",
        witsmlType: "commentString",
        maxLength: 4000,
        documentation: "A textual description of the origin."
      },
      {
        name: "yAxisAzimuth",
        required: false,
        baseType: "double",
        witsmlType: "yAxisAzimuth",
        documentation:
          "The angle of the Y axis from North (as described in attribute northDirection). Defaults to zero. Positive clockwise.",
        properties: [
          {
            name: "uom",
            required: true,
            baseType: "string",
            witsmlType: "planeAngleUom",
            maxLength: 24,
            documentation: "The unit of measure of the azimuth value.",
            isAttribute: true
          },
          {
            name: "northDirection",
            required: false,
            baseType: "string",
            witsmlType: "aziRef",
            documentation:
              "Specifies the direction to be considered North for the y axis.",
            isAttribute: true
          }
        ]
      },
      {
        name: "magneticDeclination",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "The angle between magnetic north and true north. The angle is measured positive clockwise from true north to magnetic north. This value SHOULD be given if the yAxisAzimuth is measured from the magnetic north direction.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "gridConvergence",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "The angle between true north and the northing axis or the projection grid being used. The angle is measured at the point in question, and is measured from true north to grid north, positive clockwise.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "yAxisDescription",
        required: false,
        baseType: "string",
        witsmlType: "commentString",
        maxLength: 4000,
        documentation:
          "A free-form description of the Y axis. Examples would be 'parallel to the west side of the platform', or 'along the main entry road'."
      },
      {
        name: "xRotationCounterClockwise",
        required: false,
        baseType: "boolean",
        witsmlType: "logicalBoolean",
        documentation:
          'True ("true" or "1") indicates that the X axis is rotated counter-clockwise from the Y axis when viewed from above the earth looking down. False ("false" or "0") or not given indicates a clockwise rotation. Generally the X axis is rotated clockwise.'
      }
    ]
  },
  {
    name: "description",
    required: false,
    baseType: "string",
    witsmlType: "descriptionString",
    maxLength: 256,
    documentation: "A textual description of the system."
  },
  dataGridExtensionNameValue
];
