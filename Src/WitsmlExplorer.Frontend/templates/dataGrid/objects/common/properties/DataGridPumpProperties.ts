import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridPumpProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the pump.",
    isAttribute: true
  },
  {
    name: "index",
    documentation: "Relative pump number. One-based.  "
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
    documentation: "Date and time of pump installation.  "
  },
  {
    name: "dTimRemove",
    documentation: "Date and time the pump was removed."
  },
  {
    name: "owner",
    documentation: "Contractor/owner.  "
  },
  {
    name: "typePump",
    documentation: "Pump type reference list.  "
  },
  {
    name: "numCyl",
    documentation: "Number of cylinders (3=single acting, 2 = double acting)  "
  },
  {
    name: "odRod",
    documentation: "Rod outer diameter.  ",
    properties: dataGridUomProperties
  },
  {
    name: "idLiner",
    documentation: "Inner diameter of the pump liner. ",
    properties: dataGridUomProperties
  },
  {
    name: "pumpAction",
    documentation: "Pump action. 1 = Single acting, 2 = double acting.  "
  },
  {
    name: "eff",
    documentation: "Efficiency of the pump. ",
    properties: dataGridUomProperties
  },
  {
    name: "lenStroke",
    documentation: "Stroke length. ",
    properties: dataGridUomProperties
  },
  {
    name: "presMx",
    documentation: "Maximum pump pressure.  ",
    properties: dataGridUomProperties
  },
  {
    name: "powHydMx",
    documentation: "Maximum hydraulics horsepower.  ",
    properties: dataGridUomProperties
  },
  {
    name: "spmMx",
    documentation: "Maximum Speed.  ",
    properties: dataGridUomProperties
  },
  {
    name: "displacement",
    documentation: " Pump displacement.",
    properties: dataGridUomProperties
  },
  {
    name: "presDamp",
    documentation: "Pulsation dampener pressure.  ",
    properties: dataGridUomProperties
  },
  {
    name: "volDamp",
    documentation: "Pulsation dampener volume.  ",
    properties: dataGridUomProperties
  },
  {
    name: "powMechMx",
    documentation: "Maximum mechanical power.  ",
    properties: dataGridUomProperties
  },
  {
    name: "nameTag",
    documentation:
      "An identification tag for the pump. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
