import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridDataSourceConfigurationProperties } from "templates/dataGrid/objects/common/properties/DataGridDataSourceConfigurationProperties";

export const dataGridDataSourceConfigurationSetProperties: DataGridProperty[] =
  [
    {
      name: "uid",
      documentation:
        "Unique identifier for this version set of data source configurations.",
      isAttribute: true
    },
    {
      name: "dataSourceConfiguration",
      documentation:
        "A list of data source configurations for the order. Each configuration represents a specific version containing its own set of ordered channels.",
      isContainer: true,
      isMultiple: true,
      properties: dataGridDataSourceConfigurationProperties
    },
    dataGridExtensionNameValue
  ];
