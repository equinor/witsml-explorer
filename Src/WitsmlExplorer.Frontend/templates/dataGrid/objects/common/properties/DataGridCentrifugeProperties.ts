import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridCentrifugeProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the centrifuge.",
    isAttribute: true
  },
  {
    name: "manufacturer",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Manufacturer / supplier of the item.  "
  },
  {
    name: "model",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Manufacturers designated model.  "
  },
  {
    name: "dTimInstall",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Date and time of installation.  "
  },
  {
    name: "dTimRemove",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Removal date and time.  "
  },
  {
    name: "type",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Description for the type of object.  "
  },
  {
    name: "capFlow",
    required: false,
    baseType: "double",
    witsmlType: "volumeFlowRateMeasure",
    documentation:
      "Maximum pump rate at which the unit will efficiently operate.  ",
    properties: dataGridUomProperties("volumeFlowRateUom")
  },
  {
    name: "owner",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Contractor/owner.  "
  },
  {
    name: "nameTag",
    required: false,
    witsmlType: "cs_nameTag",
    documentation:
      "An identification tag for the centrifuge. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
