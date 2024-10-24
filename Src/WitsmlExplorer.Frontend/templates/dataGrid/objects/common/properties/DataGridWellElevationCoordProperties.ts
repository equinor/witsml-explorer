import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridWellElevationCoordProperties: DataGridProperty[] = [
  {
    name: "uom",
    documentation:
      "The unit of measure of the quantity value. If not given then the default unit of measure of the explicitly or implicitly given datum must be assumed.",
    isAttribute: true
  },
  {
    name: "datum",
    documentation:
      "A pointer to the reference datum for this coordinate value as defined in WellDatum. If not given then the default WellDatum must be assumed.",
    isAttribute: true
  }
];
