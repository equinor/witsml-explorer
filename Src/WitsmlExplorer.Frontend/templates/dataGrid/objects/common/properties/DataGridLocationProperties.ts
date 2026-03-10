import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridLocationProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "The unique identifier of the location.",
    isAttribute: true
  },
  {
    name: "wellCRS",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "A pointer to the wellCRS that defines the CRS for the coordinates. While optional, it is strongly recommended that this be specified.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "latitude",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "The latitude with north being positive.",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "longitude",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "The longitude with east being positive.",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "easting",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The projected coordinate with east being positive. This is the most common type of projected coordinates. UTM coordinates are expressed in Easting and Northing.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "northing",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The projected coordinate with north being positive. This is the most common type of projected coordinates. UTM coordinates are expressed in Easting and Northing.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "westing",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The projected coordinate with west being positive. The positive directions are reversed from the usual Easting and Northing values. These values are generally located in the southern hemisphere, most notably in South Africa and Australia.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "southing",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The projected coordinate with south being positive. The positive directions are reversed from the usual Easting and Northing values. These values are generally located in the southern hemisphere, most notably in South Africa and Australia.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "projectedX",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The projected X coordinate with the positive direction unknown. ProjectedX and ProjectedY are used when it is not known what the meaning of the coordinates is. If the meaning is known, the Easting/Northing or Westing/Southing should be used. Use of this pair implies a lack of knowledge on the part of the sender.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "projectedY",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The projected Y coordinate with the positive direction unknown. ProjectedX and ProjectedY are used when it is not known what the meaning of the coordinates is. If the meaning is known, the Easting/Northing or Westing/Southing should be used. Use of this pair implies a lack of knowledge on the part of the sender.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "localX",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The local (engineering) X coordinate. The CRS will define the orientation of the axis.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "localY",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The local (engineering) Y coordinate. The CRS will define the orientation of the axis.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "original",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Flag indicating (if "true " or "1 ") that this pair of values was the original data given for the location. If the pair of values was calculated from an original pair of values, this flag should be "false " (or "0 "), or not present.'
  },
  {
    name: "description",
    required: false,
    baseType: "string",
    witsmlType: "descriptionString",
    maxLength: 256,
    documentation:
      "A Comment, generally given to help the reader interpret the coordinates if the CRS and the chosen pair do not make them clear."
  },
  dataGridExtensionNameValue
];
