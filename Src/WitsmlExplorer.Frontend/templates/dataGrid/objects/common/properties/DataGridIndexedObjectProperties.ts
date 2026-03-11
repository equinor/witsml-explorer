import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridIndexedObjectProperties: DataGridProperty[] = [
  {
    name: "index",
    required: true,
    baseType: "int",
    witsmlType: "positiveCount",
    documentation:
      "Indexes things with the same name. That is the first one, the second one, etc.",
    isAttribute: true
  },
  {
    name: "name",
    required: false,
    baseType: "string",
    witsmlType: "kindString",
    maxLength: 50,
    documentation: "",
    isAttribute: true
  },
  {
    name: "uom",
    required: false,
    baseType: "string",
    witsmlType: "uomString",
    maxLength: 24,
    documentation: "",
    isAttribute: true
  },
  {
    name: "description",
    required: false,
    baseType: "string",
    witsmlType: "descriptionString",
    maxLength: 256,
    documentation: "",
    isAttribute: true
  },
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the node.",
    isAttribute: true
  }
];
