import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";

export const dataGridRefWellWellboreRigProperties: DataGridProperty[] = [
  {
    name: "rigReference",
    required: true,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation: "A pointer to the rig with which there is a relationship.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "wellboreParent",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "A pointer to the wellbore that contains the rigReference. This is not needed unless the referenced rig is outside the context of a common parent wellbore.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "wellParent",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "A pointer to the well that contains the wellboreParent. This is not needed unless the referenced wellbore is outside the context of a common parent well.",
    properties: dataGridRefNameStringProperties
  }
];
