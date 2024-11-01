import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionAny } from "templates/dataGrid/objects/common/DataGridExtensionAny";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridSensorProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the sensor.",
    isAttribute: true
  },
  {
    name: "typeMeasurement",
    documentation: "Type from POSC."
  },
  {
    name: "offsetBot",
    documentation: "Offset from bottom of measurement while drilling tool.",
    properties: dataGridUomProperties
  },
  {
    name: "comments",
    documentation: "Comments and remarks."
  },
  dataGridCustomData,
  dataGridExtensionAny,
  dataGridExtensionNameValue
];
