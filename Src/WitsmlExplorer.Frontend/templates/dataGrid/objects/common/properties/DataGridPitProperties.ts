import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridPitProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the pit.",
    isAttribute: true
  },
  {
    name: "index",
    required: true,
    baseType: "int",
    witsmlType: "positiveCount",
    documentation: "Relative pit number of all pits on the rig. One-based."
  },
  {
    name: "dTimInstall",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Date and time of installation."
  },
  {
    name: "dTimRemove",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Removal date and time."
  },
  {
    name: "capMx",
    required: true,
    baseType: "double",
    witsmlType: "volumeMeasure",
    documentation: "Maximum pit capacity.",
    properties: dataGridUomProperties("volumeUom")
  },
  {
    name: "owner",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Contractor/owner."
  },
  {
    name: "typePit",
    required: false,
    baseType: "string",
    witsmlType: "pitType",
    maxLength: 50,
    documentation: "The type of pit."
  },
  {
    name: "isActive",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Flag to indicate if Pit is part of the active system. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "nameTag",
    required: false,
    witsmlType: "cs_nameTag",
    documentation:
      "An identification tag for the pit. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
