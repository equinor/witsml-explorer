import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridCostProperties: DataGridProperty[] = [
  {
    name: "currency",
    required: false,
    baseType: "string",
    witsmlType: "kindString",
    maxLength: 50,
    documentation: "",
    isAttribute: true
  }
];
