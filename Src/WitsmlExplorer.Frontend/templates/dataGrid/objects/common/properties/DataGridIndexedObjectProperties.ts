import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridIndexedObjectProperties: DataGridProperty[] = [
  {
    name: "index",
    documentation:
      "Indexes things with the same name. That is the first one, the second one, etc.",
    isAttribute: true
  },
  {
    name: "name",
    documentation: "",
    isAttribute: true
  },
  {
    name: "uom",
    documentation: "",
    isAttribute: true
  },
  {
    name: "description",
    documentation: "",
    isAttribute: true
  },
  {
    name: "uid",
    documentation: "Unique identifier for the node.",
    isAttribute: true
  }
];
