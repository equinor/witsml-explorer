import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridDegasserProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the degasser.",
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
    name: "owner",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Contractor/owner.  "
  },
  {
    name: "height",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Height of separator.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "len",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of separator.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "id",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Internal diameter of object.  ",
    properties: dataGridUomProperties("lengthUom")
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
    name: "areaSeparatorFlow",
    required: false,
    baseType: "double",
    witsmlType: "areaMeasure",
    documentation: "Flow area of separator.  ",
    properties: dataGridUomProperties("areaUom")
  },
  {
    name: "htMudSeal",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Depth of trip-tank fluid level to provide back pressure against separator flow.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idInlet",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Internal diameter of inlet line.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idVentLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Internal diameter of vent line.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenVentLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of vent line.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "capGasSep",
    required: false,
    baseType: "double",
    witsmlType: "volumeFlowRateMeasure",
    documentation: "Safe gas separating capacity.  ",
    properties: dataGridUomProperties("volumeFlowRateUom")
  },
  {
    name: "capBlowdown",
    required: false,
    baseType: "double",
    witsmlType: "volumeFlowRateMeasure",
    documentation: "Gas vent rate at which the vent line pressur",
    properties: dataGridUomProperties("volumeFlowRateUom")
  },
  {
    name: "presRating",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Pressure rating of the item.  ",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "tempRating",
    required: false,
    baseType: "double",
    witsmlType: "thermodynamicTemperatureMeasure",
    documentation: "Temperature rating of separator.  ",
    properties: dataGridUomProperties("thermodynamicTemperatureUom")
  },
  {
    name: "nameTag",
    required: false,
    witsmlType: "cs_nameTag",
    documentation:
      "An identification tag for the degasser. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
