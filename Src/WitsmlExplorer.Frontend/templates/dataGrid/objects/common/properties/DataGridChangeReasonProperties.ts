import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

export const dataGridChangeReasonProperties: DataGridProperty[] = [
  {
    name: "changedBy",
    documentation:
      "The name or identifier of the person or system responsible for the changes."
  },
  {
    name: "dTimChanged",
    documentation: "The date and time when the changes were made."
  },
  {
    name: "isChangedDataRequirements",
    documentation:
      'Indicates whether this version introduces changes that affect the data to be delivered. This value should be set to true whenever a channel is added, removed, or any of the following channel configuration properties are modified: mnemonic, uom, globalMnemonic, indexType, toolName, service, sensorOffset, criticality, requirements. Requirements exceptions: comments, extensionNameValue, if the requirementPurpose of the modified requirement is set to "display range".'
  },
  {
    name: "comments",
    documentation: "Comments describing the reason or context for the changes."
  },
  {
    name: "channelAdded",
    documentation:
      "A list of the mnemonic names of all channels added since the previous configuration version.",
    isMultiple: true
  },
  {
    name: "channelModified",
    documentation:
      "A list of the mnemonic names of all channels modified since the previous configuration version.",
    isMultiple: true
  },
  {
    name: "channelRemoved",
    documentation:
      "A list of the mnemonic names of all channels removed since the previous configuration version.",
    isMultiple: true
  },
  dataGridExtensionNameValue
];
