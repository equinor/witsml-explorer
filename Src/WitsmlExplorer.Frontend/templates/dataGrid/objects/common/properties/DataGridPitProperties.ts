import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridPitProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the pit.",
    isAttribute: true
  },
  {
    name: "index",
    documentation: "Relative pit number of all pits on the rig. One-based."
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
    name: "capMx",
    documentation: "Maximum pit capacity.",
    properties: dataGridUomProperties
  },
  {
    name: "owner",
    documentation: "Contractor/owner."
  },
  {
    name: "typePit",
    documentation: "The type of pit."
  },
  {
    name: "isActive",
    documentation:
      'Flag to indicate if Pit is part of the active system. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "nameTag",
    documentation:
      "An identification tag for the pit. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
