import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionAny } from "templates/dataGrid/objects/common/DataGridExtensionAny";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridSensorProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the sensor.",
    isAttribute: true
  },
  {
    name: "typeMeasurement",
    required: false,
    baseType: "string",
    witsmlType: "measurementType",
    maxLength: 50,
    documentation: "Type from POSC."
  },
  {
    name: "offsetBot",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Offset from bottom of measurement while drilling tool.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "comments",
    required: false,
    baseType: "string",
    witsmlType: "commentString",
    maxLength: 4000,
    documentation: "Comments and remarks."
  },
  dataGridCustomData,
  dataGridExtensionAny,
  dataGridExtensionNameValue
];
