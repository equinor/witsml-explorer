import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridLithostratigraphyStructProperties: DataGridProperty[] = [
  {
    name: "kind",
    required: false,
    baseType: "string",
    witsmlType: "lithostratigraphyUnit",
    maxLength: 50,
    documentation: "The unit of lithostratigraphy.",
    isAttribute: true
  }
];
