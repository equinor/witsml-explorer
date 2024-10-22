import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridShakerProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the shaker.",
    isAttribute: true
  },
  {
    name: "name",
    documentation: "Human recognizable context for the shaker."
  },
  {
    name: "manufacturer",
    documentation: "Manufacturer / supplier of the item."
  },
  {
    name: "model",
    documentation: "Manufacturers designated model."
  },
  {
    name: "dTimInstall",
    documentation: "Date and time of installation."
  },
  {
    name: "dTimRemove",
    documentation: "Removal date and time."
  },
  {
    name: "type",
    documentation: "Description for the type of object."
  },
  {
    name: "locationShaker",
    documentation: "Shaker location on rig."
  },
  {
    name: "numDecks",
    documentation: "Number of decks."
  },
  {
    name: "numCascLevel",
    documentation: "Number of cascade levels."
  },
  {
    name: "mudCleaner",
    documentation:
      'Is part of mud cleaning assembly as opposed to discrete Shale Shaker. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "capFlow",
    documentation:
      "Maximum pump rate at which the unit will efficiently operate.",
    properties: dataGridUomProperties
  },
  {
    name: "owner",
    documentation: "Contractor/owner."
  },
  {
    name: "sizeMeshMn",
    documentation: "Minimum mesh size.",
    properties: dataGridUomProperties
  },
  {
    name: "nameTag",
    documentation:
      "An identification tag for the shaker. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
