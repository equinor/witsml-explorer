import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridRefNameStringProperties: DataGridProperty[] = [
  {
    name: "uidRef",
    documentation:
      "A reference to the unique identifier (uid attribute) in the node referenced by the name value. This attribute is required within the context of a WITSML server.",
    isAttribute: true
  }
];
