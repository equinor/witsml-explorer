import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridChannelRequirementProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the order log.",
    isAttribute: true
  },
  {
    name: "purpose",
    documentation:
      "Describes the purpose of the requirement, such as operational range, display range, or safety-related constraints."
  },
  {
    name: "minInterval",
    documentation: "Minimum expected time interval between data points.",
    properties: dataGridUomProperties
  },
  {
    name: "maxInterval",
    documentation: "Maximum allowable time interval between data points.",
    properties: dataGridUomProperties
  },
  {
    name: "minPrecision",
    documentation:
      "Specifies the minimum number of significant digits that should be preserved in curve values. This ensures sufficient numeric detail relative to the unit of measure.",
    properties: dataGridUomProperties
  },
  {
    name: "maxPrecision",
    documentation:
      "Specifies the maximum number of significant digits that should be preserved in curve values. This limits unnecessary precision while retaining adequate detail for the unit of measure.",
    properties: dataGridUomProperties
  },
  {
    name: "minValue",
    documentation:
      "Minimum data value relative to the purpose and the defined unit for the channel.",
    properties: dataGridUomProperties
  },
  {
    name: "maxValue",
    documentation:
      "Maximum data value relative to the purpose and the defined unit for the channel.",
    properties: dataGridUomProperties
  },
  {
    name: "minStep",
    documentation:
      "Specifies the minimum step size for the channel's data index.",
    properties: dataGridUomProperties
  },
  {
    name: "maxStep",
    documentation:
      "Specifies the maximum step size for the channel's data index.",
    properties: dataGridUomProperties
  },
  {
    name: "minDelta",
    documentation:
      "Minimum expected rate of change between the values in consecutive indexes.",
    properties: dataGridUomProperties
  },
  {
    name: "maxDelta",
    documentation:
      "Maximum allowable rate of change between the values in consecutive indexes.",
    properties: dataGridUomProperties
  },
  {
    name: "latency",
    documentation:
      "Indicates the maximum acceptable delay in data delivery for the channel expressed in seconds.",
    properties: dataGridUomProperties
  },
  {
    name: "mdThreshold",
    documentation:
      "Maximum allowable delta between the row index and the min or max index for the log subject to index direction and expressed in the index unit.",
    properties: dataGridUomProperties
  },
  {
    name: "dynamicMdThreshold",
    documentation:
      "Indicates that the threshold value is to be determined dynamically during data delivery. Used only when MdThreshold is not specified."
  },
  {
    name: "comments",
    documentation: "Optional comments providing additional context."
  },
  dataGridExtensionNameValue
];
