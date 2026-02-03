import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridChannelRequirementProperties } from "templates/dataGrid/objects/common/properties/DataGridChannelRequirementProperties";
import { dataGridShortNameStructProperties } from "templates/dataGrid/objects/common/properties/DataGridNameStructProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridChannelConfigurationProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the channel configuration.",
    isAttribute: true
  },
  {
    name: "mnemonic",
    documentation:
      "The curve name. This must be unique for all curves in a log. The naming authority for the mnemonic can be catptured in the namingSystem attribute. Since both the mnemonic and uid have similar requirements within the context of a WITSML server, the uid can be derived from the mnemonic (e.g., by converting blank to underscore).",
    properties: dataGridShortNameStructProperties
  },
  {
    name: "uom",
    documentation: "Unit of measurement of the data values."
  },
  {
    name: "globalMnemonic",
    documentation: "A standardized mnemonic name for this channel.",
    properties: dataGridShortNameStructProperties
  },
  {
    name: "indexType",
    documentation: "The kind of index (date time, measured depth, etc.)."
  },
  {
    name: "toolName",
    documentation: "Data source, could be tool name/id."
  },
  {
    name: "service",
    documentation: "The service this channel provides."
  },
  {
    name: "sensorOffset",
    documentation:
      "The planned consistent distance from the downhole equipment vertical reference (the drill bit, for MWD logs; the tool zero reference for wireline logs) at which the channel values are measured or calculated. This is typically, but not always, the distance from the bit to the sensor. This element is only informative (channel values are presented at actual depth, not requiring subtraction of an offset).",
    properties: dataGridUomProperties
  },
  {
    name: "criticality",
    documentation:
      "Criticality of the channel specified as low, medium or high."
  },
  {
    name: "logName",
    documentation:
      "The name of the log that the channel is expected to be a part of. The log might not exist yet."
  },
  {
    name: "description",
    documentation: "Free format description of the channel configuration."
  },
  {
    name: "comments",
    documentation: "Optional comments providing additional context."
  },
  {
    name: "requirement",
    documentation: "Quality requirement of the channel data.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridChannelRequirementProperties
  },
  dataGridCustomData,
  dataGridExtensionNameValue
];
