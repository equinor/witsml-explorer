import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";

export const dataGridRefWellWellboreProperties: DataGridProperty[] = [
  {
    name: "wellboreReference",
    documentation: "A pointer the wellbore with which there is a relationship.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "wellParent",
    documentation:
      "A pointer to the well that contains the wellboreReference. This is not needed unless the referenced wellbore is outside the context of a common parent well.",
    properties: dataGridRefNameStringProperties
  }
];
