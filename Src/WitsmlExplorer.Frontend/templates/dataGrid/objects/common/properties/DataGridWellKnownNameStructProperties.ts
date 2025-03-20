import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridWellKnownNameStructProperties: DataGridProperty[] = [
  {
    name: "namingSystem",
    documentation: "The naming system within the name is unique.",
    isAttribute: true
  },
  {
    name: "code",
    documentation: "A unique (short) code associated with the name.",
    isAttribute: true
  }
];
