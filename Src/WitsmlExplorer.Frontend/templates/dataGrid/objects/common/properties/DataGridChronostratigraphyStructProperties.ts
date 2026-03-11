import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridChronostratigraphyStructProperties: DataGridProperty[] = [
  {
    name: "kind",
    required: false,
    baseType: "string",
    witsmlType: "chronostratigraphyUnit",
    maxLength: 50,
    documentation: "The unit of chronostratigraphy.",
    isAttribute: true
  }
];
