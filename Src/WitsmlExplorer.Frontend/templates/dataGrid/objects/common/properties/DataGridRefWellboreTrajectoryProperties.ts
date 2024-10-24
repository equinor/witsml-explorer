import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";

export const dataGridRefWellboreTrajectoryProperties: DataGridProperty[] = [
  {
    name: "trajectoryReference",
    documentation: "A pointer to the trajectory within the wellbore.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "wellboreParent",
    documentation:
      "A pointer to the wellbore that contains the trajectoryReference. This is not needed unless the trajectory is outside the context of a common parent wellbore.",
    properties: dataGridRefNameStringProperties
  }
];
