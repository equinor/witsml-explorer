import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridChangeReasonProperties } from "templates/dataGrid/objects/common/properties/DataGridChangeReasonProperties";
import { dataGridChannelConfigurationProperties } from "templates/dataGrid/objects/common/properties/DataGridChannelConfigurationProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridDataSourceConfigurationProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the configuration.",
    isAttribute: true
  },
  {
    name: "versionNumber",
    required: false,
    baseType: "int",
    witsmlType: "positiveCount",
    documentation:
      "Specifies the version of the data source configuration. Each new version represents a distinct update or revision, allowing for the tracking of changes over time without altering previous versions.",
    isAttribute: true
  },
  {
    name: "name",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Human-readable name of the data source configuration."
  },
  {
    name: "description",
    required: true,
    baseType: "string",
    witsmlType: "descriptionString",
    maxLength: 256,
    documentation:
      "Description providing additional context about the data source configuration."
  },
  {
    name: "nominalHoleSize",
    required: true,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The nominal hole size associated with this data source configuration.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "tubular",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "This represents a foreign key to the tubular (assembly) that will be utilized in this configuration.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "status",
    required: false,
    baseType: "string",
    witsmlType: "sectionOrderStatus",
    maxLength: 50,
    documentation:
      "Status of the order for this configuration. This indicates the current progress or approval stage of the section within the data work order lifecycle."
  },
  {
    name: "timeStatus",
    required: false,
    baseType: "string",
    witsmlType: "operationStatus",
    maxLength: 50,
    documentation:
      "Current status of the time-based operation in this configuration."
  },
  {
    name: "depthStatus",
    required: false,
    baseType: "string",
    witsmlType: "operationStatus",
    maxLength: 50,
    documentation:
      "Current status of the depth-based operation in this configuration."
  },
  {
    name: "dTimPlannedStart",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation:
      "The anticipated date and time for the commencement of data delivery for this configuration."
  },
  {
    name: "dTimPlannedStop",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation:
      "The anticipated date and time for the end of data delivery for this configuration."
  },
  {
    name: "mDPlannedStart",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The anticipated depth at which data delivery for this configuration is expected to begin.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "mDPlannedStop",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "The anticipated depth at which data delivery for this configuration is expected to end.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "dTimChangeDeadline",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation:
      "Change deadline for the order for this section. This datetime represents the deadline for making regular changes to the section. Changes made after this point may incur penalties in KPIs or be flagged as late changes, depending on the agreed-upon terms."
  },
  {
    name: "channelConfiguration",
    required: false,
    witsmlType: "cs_channelConfiguration",
    documentation:
      "A list of channels that should be used for the configuration.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridChannelConfigurationProperties
  },
  {
    name: "changeReason",
    required: false,
    witsmlType: "cs_configurationChangeReason",
    documentation:
      "Represents the reason for a change of a data source configuration.",
    isContainer: true,
    properties: dataGridChangeReasonProperties
  },
  dataGridCustomData,
  dataGridExtensionNameValue
];
