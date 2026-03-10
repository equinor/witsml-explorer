import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridChannelRequirementProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the order log.",
    isAttribute: true
  },
  {
    name: "purpose",
    required: false,
    baseType: "string",
    witsmlType: "requirementPurpose",
    maxLength: 50,
    documentation:
      "Describes the purpose of the requirement, such as operational range, display range, or safety-related constraints."
  },
  {
    name: "minInterval",
    required: false,
    baseType: "double",
    witsmlType: "timeMeasure",
    documentation: "Minimum expected time interval between data points.",
    properties: dataGridUomProperties("timeUom")
  },
  {
    name: "maxInterval",
    required: false,
    baseType: "double",
    witsmlType: "timeMeasure",
    documentation: "Maximum allowable time interval between data points.",
    properties: dataGridUomProperties("timeUom")
  },
  {
    name: "minPrecision",
    required: false,
    baseType: "double",
    witsmlType: "genericMeasure",
    documentation:
      "Specifies the minimum number of significant digits that should be preserved in curve values. This ensures sufficient numeric detail relative to the unit of measure.",
    properties: dataGridUomProperties()
  },
  {
    name: "maxPrecision",
    required: false,
    baseType: "double",
    witsmlType: "genericMeasure",
    documentation:
      "Specifies the maximum number of significant digits that should be preserved in curve values. This limits unnecessary precision while retaining adequate detail for the unit of measure.",
    properties: dataGridUomProperties()
  },
  {
    name: "minValue",
    required: false,
    baseType: "double",
    witsmlType: "genericMeasure",
    documentation:
      "Minimum data value relative to the purpose and the defined unit for the channel.",
    properties: dataGridUomProperties()
  },
  {
    name: "maxValue",
    required: false,
    baseType: "double",
    witsmlType: "genericMeasure",
    documentation:
      "Maximum data value relative to the purpose and the defined unit for the channel.",
    properties: dataGridUomProperties()
  },
  {
    name: "minStep",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Specifies the minimum step size for the channel's data index.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "maxStep",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Specifies the maximum step size for the channel's data index.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "minDelta",
    required: false,
    baseType: "double",
    witsmlType: "genericMeasure",
    documentation:
      "Minimum expected rate of change between the values in consecutive indexes.",
    properties: dataGridUomProperties()
  },
  {
    name: "maxDelta",
    required: false,
    baseType: "double",
    witsmlType: "genericMeasure",
    documentation:
      "Maximum allowable rate of change between the values in consecutive indexes.",
    properties: dataGridUomProperties()
  },
  {
    name: "latency",
    required: false,
    baseType: "double",
    witsmlType: "timeMeasure",
    documentation:
      "Indicates the maximum acceptable delay in data delivery for the channel expressed in seconds.",
    properties: dataGridUomProperties("timeUom")
  },
  {
    name: "mdThreshold",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Maximum allowable delta between the row index and the min or max index for the log subject to index direction and expressed in the index unit.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "dynamicMdThreshold",
    required: false,
    baseType: "boolean",
    witsmlType: "boolean",
    documentation:
      "Indicates that the threshold value is to be determined dynamically during data delivery. Used only when MdThreshold is not specified."
  },
  {
    name: "comments",
    required: false,
    baseType: "string",
    witsmlType: "commentString",
    maxLength: 4000,
    documentation: "Optional comments providing additional context."
  },
  dataGridExtensionNameValue
];
