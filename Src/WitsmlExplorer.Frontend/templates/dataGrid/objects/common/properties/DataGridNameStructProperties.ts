import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridNameStructProperties: DataGridProperty[] = [
  {
    name: "namingSystem",
    documentation: "The naming system within the name is (hopefully) unique.",
    isAttribute: true
  }
];

export const dataGridShortNameStructProperties: DataGridProperty[] = [
  ...dataGridNameStructProperties
];
