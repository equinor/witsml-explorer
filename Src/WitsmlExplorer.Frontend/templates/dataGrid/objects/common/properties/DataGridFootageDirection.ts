import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridFootageNorthSouth: DataGridProperty[] = [
  {
    name: "uom",
    documentation: "The unit of measure of the distance value.",
    isAttribute: true
  },
  {
    name: "ref",
    documentation:
      "Specifies the reference line that is the origin of the distance.",
    isAttribute: true
  }
];

export const dataGridFootageEastWest: DataGridProperty[] = [
  ...dataGridFootageNorthSouth
];
