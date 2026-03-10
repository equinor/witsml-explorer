import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridWellKnownNameStructProperties: DataGridProperty[] = [
  {
    name: "namingSystem",
    required: true,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "The naming system within the name is unique.",
    isAttribute: true
  },
  {
    name: "code",
    required: false,
    baseType: "string",
    witsmlType: "kindString",
    maxLength: 50,
    documentation: "A unique (short) code associated with the name.",
    isAttribute: true
  }
];
