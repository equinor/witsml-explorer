import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridRefObjectStringProperties: DataGridProperty[] = [
  {
    name: "object",
    required: true,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation:
      "The type of data-object being referenced (e.g., 'well', 'wellbore').",
    isAttribute: true
  },
  {
    name: "uidRef",
    required: false,
    baseType: "string",
    witsmlType: "refString",
    maxLength: 64,
    documentation:
      "A reference to the unique identifier (uid attribute) in the object referenced by the name value. This attribute is required within the context of a WITSML server.",
    isAttribute: true
  }
];
