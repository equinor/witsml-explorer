import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridDegasserProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the degasser.",
    isAttribute: true
  },
  {
    name: "manufacturer",
    documentation: "Manufacturer / supplier of the item.  "
  },
  {
    name: "model",
    documentation: "Manufacturers designated model.  "
  },
  {
    name: "dTimInstall",
    documentation: "Date and time of installation.  "
  },
  {
    name: "dTimRemove",
    documentation: "Removal date and time.  "
  },
  {
    name: "type",
    documentation: "Description for the type of object.  "
  },
  {
    name: "owner",
    documentation: "Contractor/owner.  "
  },
  {
    name: "height",
    documentation: "Height of separator.  ",
    properties: dataGridUomProperties
  },
  {
    name: "len",
    documentation: "Length of separator.  ",
    properties: dataGridUomProperties
  },
  {
    name: "id",
    documentation: "Internal diameter of object.  ",
    properties: dataGridUomProperties
  },
  {
    name: "capFlow",
    documentation:
      "Maximum pump rate at which the unit will efficiently operate.  ",
    properties: dataGridUomProperties
  },
  {
    name: "areaSeparatorFlow",
    documentation: "Flow area of separator.  ",
    properties: dataGridUomProperties
  },
  {
    name: "htMudSeal",
    documentation:
      "Depth of trip-tank fluid level to provide back pressure against separator flow.  ",
    properties: dataGridUomProperties
  },
  {
    name: "idInlet",
    documentation: "Internal diameter of inlet line.  ",
    properties: dataGridUomProperties
  },
  {
    name: "idVentLine",
    documentation: "Internal diameter of vent line.  ",
    properties: dataGridUomProperties
  },
  {
    name: "lenVentLine",
    documentation: "Length of vent line.  ",
    properties: dataGridUomProperties
  },
  {
    name: "capGasSep",
    documentation: "Safe gas separating capacity.  ",
    properties: dataGridUomProperties
  },
  {
    name: "capBlowdown",
    documentation: "Gas vent rate at which the vent line pressur",
    properties: dataGridUomProperties
  },
  {
    name: "presRating",
    documentation: "Pressure rating of the item.  ",
    properties: dataGridUomProperties
  },
  {
    name: "tempRating",
    documentation: "Temperature rating of separator.  ",
    properties: dataGridUomProperties
  },
  {
    name: "nameTag",
    documentation:
      "An identification tag for the degasser. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
