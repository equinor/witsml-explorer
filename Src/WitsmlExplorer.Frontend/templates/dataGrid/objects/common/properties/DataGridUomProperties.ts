import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridUomProperties = (
  witsmlType: string = "uomString"
): DataGridProperty[] => [
  {
    name: "uom",
    required: true,
    baseType: "string",
    witsmlType,
    maxLength: 24,
    documentation: "The unit of measure of the quantity value.",
    isAttribute: true
  }
];
