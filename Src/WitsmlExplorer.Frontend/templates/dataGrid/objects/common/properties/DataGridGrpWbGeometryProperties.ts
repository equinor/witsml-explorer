import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridGrpWbGeometryProperties: DataGridProperty[] = [
  {
    name: "dTimReport",
    required: true,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Time report generated."
  },
  {
    name: "mdBottom",
    required: false,
    baseType: "double",
    witsmlType: "measuredDepthCoord",
    documentation: "Measured depth at bottom.",
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "gapAir",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Air gap.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "depthWaterMean",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Water depth.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "wbGeometrySection",
    required: false,
    witsmlType: "cs_wbGeometrySection",
    documentation: "Wellbore geometry section object.",
    isContainer: true,
    isMultiple: true,
    properties: [
      {
        name: "uid",
        required: false,
        baseType: "string",
        witsmlType: "uidString",
        maxLength: 64,
        documentation: "Unique identifier for the wellbore geometry section.",
        isAttribute: true
      },
      {
        name: "typeHoleCasing",
        required: false,
        baseType: "string",
        witsmlType: "holeCasingType",
        maxLength: 50,
        documentation: "Type of fixed component."
      },
      {
        name: "mdTop",
        required: false,
        baseType: "double",
        witsmlType: "measuredDepthCoord",
        documentation: "Measured depth at Top of Interval.",
        properties: dataGridMeasuredDepthCoordProperties
      },
      {
        name: "mdBottom",
        required: false,
        baseType: "double",
        witsmlType: "measuredDepthCoord",
        documentation: "Measured depth at bottom of the section.",
        properties: dataGridMeasuredDepthCoordProperties
      },
      {
        name: "tvdTop",
        required: false,
        baseType: "double",
        witsmlType: "wellVerticalDepthCoord",
        documentation: "True vertical depth at top of the section.",
        properties: dataGridWellVerticalDepthCoordProperties
      },
      {
        name: "tvdBottom",
        required: false,
        baseType: "double",
        witsmlType: "wellVerticalDepthCoord",
        documentation: "True vertical depth at bottom of the section.",
        properties: dataGridWellVerticalDepthCoordProperties
      },
      {
        name: "idSection",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Inner diameter.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "odSection",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Outer diameter - Only for casings and risers.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "wtPerLen",
        required: false,
        baseType: "double",
        witsmlType: "massPerLengthMeasure",
        documentation: "Weight per unit length for casing sections.",
        properties: dataGridUomProperties("massPerLengthUom")
      },
      {
        name: "grade",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation: "Material grade for the tubular section."
      },
      {
        name: "curveConductor",
        required: false,
        baseType: "boolean",
        witsmlType: "logicalBoolean",
        documentation:
          'Curved conductor? Values are "true" (or "1") and "false" (or "0").'
      },
      {
        name: "diaDrift",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Maximum diameter that can pass through.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "factFric",
        required: false,
        baseType: "double",
        witsmlType: "unitlessQuantity",
        documentation: "Friction factor."
      },
      dataGridExtensionNameValue
    ]
  }
];
