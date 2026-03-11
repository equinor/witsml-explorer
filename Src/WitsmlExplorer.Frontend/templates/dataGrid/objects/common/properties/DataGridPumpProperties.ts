import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridPumpProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the pump.",
    isAttribute: true
  },
  {
    name: "index",
    required: true,
    baseType: "int",
    witsmlType: "positiveCount",
    documentation: "Relative pump number. One-based.  "
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
    documentation: "Date and time of pump installation.  "
  },
  {
    name: "dTimRemove",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Date and time the pump was removed."
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
    name: "typePump",
    required: false,
    baseType: "string",
    witsmlType: "pumpType",
    maxLength: 50,
    documentation: "Pump type reference list.  "
  },
  {
    name: "numCyl",
    required: false,
    baseType: "int",
    witsmlType: "positiveCount",
    documentation: "Number of cylinders (3=single acting, 2 = double acting)  "
  },
  {
    name: "odRod",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Rod outer diameter.  ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idLiner",
    required: true,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of the pump liner. ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "pumpAction",
    required: false,
    baseType: "int",
    witsmlType: "pumpActionIntegerCode",
    documentation: "Pump action. 1 = Single acting, 2 = double acting.  "
  },
  {
    name: "eff",
    required: false,
    baseType: "double",
    witsmlType: "relativePowerMeasure",
    documentation: "Efficiency of the pump. ",
    properties: dataGridUomProperties("relativePowerUom")
  },
  {
    name: "lenStroke",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Stroke length. ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "presMx",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Maximum pump pressure.  ",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "powHydMx",
    required: false,
    baseType: "double",
    witsmlType: "powerMeasure",
    documentation: "Maximum hydraulics horsepower.  ",
    properties: dataGridUomProperties("powerUom")
  },
  {
    name: "spmMx",
    required: false,
    baseType: "double",
    witsmlType: "anglePerTimeMeasure",
    documentation: "Maximum Speed.  ",
    properties: dataGridUomProperties("anglePerTimeUom")
  },
  {
    name: "displacement",
    required: true,
    baseType: "double",
    witsmlType: "volumeMeasure",
    documentation: " Pump displacement.",
    properties: dataGridUomProperties("volumeUom")
  },
  {
    name: "presDamp",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Pulsation dampener pressure.  ",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "volDamp",
    required: false,
    baseType: "double",
    witsmlType: "volumeMeasure",
    documentation: "Pulsation dampener volume.  ",
    properties: dataGridUomProperties("volumeUom")
  },
  {
    name: "powMechMx",
    required: false,
    baseType: "double",
    witsmlType: "powerMeasure",
    documentation: "Maximum mechanical power.  ",
    properties: dataGridUomProperties("powerUom")
  },
  {
    name: "nameTag",
    required: false,
    witsmlType: "cs_nameTag",
    documentation:
      "An identification tag for the pump. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
