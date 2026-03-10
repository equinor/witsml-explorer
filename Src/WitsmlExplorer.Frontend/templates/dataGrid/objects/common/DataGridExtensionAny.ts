import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridExtensionAny: DataGridProperty = {
  name: "extensionAny",
  required: false,
  witsmlType: "cs_extensionAny",
  isContainer: true,
  documentation: "Extensions to the schema using an xsd:any construct."
};
