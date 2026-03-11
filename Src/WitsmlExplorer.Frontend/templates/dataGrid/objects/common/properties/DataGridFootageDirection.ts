import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridFootageNorthSouth: DataGridProperty[] = [
  {
    name: "uom",
    required: true,
    baseType: "string",
    witsmlType: "lengthUom",
    maxLength: 24,
    documentation: "The unit of measure of the distance value.",
    isAttribute: true
  },
  {
    name: "ref",
    required: true,
    baseType: "string",
    witsmlType: "northOrSouth",
    maxLength: 50,
    documentation:
      "Specifies the reference line that is the origin of the distance.",
    isAttribute: true
  }
];

export const dataGridFootageEastWest: DataGridProperty[] = [
  {
    name: "uom",
    required: true,
    baseType: "string",
    witsmlType: "lengthUom",
    maxLength: 24,
    documentation: "The unit of measure of the distance value.",
    isAttribute: true
  },
  {
    name: "ref",
    required: true,
    baseType: "string",
    witsmlType: "eastOrWest",
    maxLength: 50,
    documentation:
      "Specifies the reference line that is the origin of the distance.",
    isAttribute: true
  }
];
