import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridAssetContactProperties } from "templates/dataGrid/objects/common/properties/DataGridAssetContactProperties";
import { dataGridDataSourceConfigurationSetProperties } from "templates/dataGrid/objects/common/properties/DataGridDataSourceConfigurationSetProperties";

export const dataGridDataWorkOrder: DataGridProperty = {
  name: "dataWorkOrders",
  documentation: "",
  isContainer: true,
  properties: [
    {
      name: "xmlns",
      documentation: "",
      isAttribute: true
    },
    {
      name: "version",
      documentation: "",
      isAttribute: true
    },
    {
      name: "dataWorkOrder",
      documentation: "A single data order object.",
      isMultiple: true,
      isContainer: true,
      properties: [
        {
          name: "uidWell",
          documentation:
            "Unique identifier for the well. This uniquely represents the well referenced by the (possibly non-unique) nameWell.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          documentation:
            "Unique identifier for the wellbore. This uniquely represents the wellbore referenced by the (possibly non-unique) nameWellbore.",
          isAttribute: true
        },
        {
          name: "uid",
          documentation: "Unique identifier for the data order.",
          isAttribute: true
        },
        {
          name: "dwoVersion",
          documentation:
            "Semantic version of the DataWorkOrder schema. Not to be confused with the WITSML version or DataSourceConfiguration versionNumber.",
          isAttribute: true
        },
        {
          name: "nameWell",
          documentation:
            "Human recognizable context for the well that contains the wellbore."
        },
        {
          name: "nameWellbore",
          documentation:
            "Human recognizable context for the wellbore that contains the data work order."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the data work order."
        },
        {
          name: "field",
          documentation: "Name of the field the order applies to."
        },
        {
          name: "dataProvider",
          documentation:
            "The entity responsible for delivering the data specified in the order."
        },
        {
          name: "dataConsumer",
          documentation:
            "The entity that orders and consumes the data as defined in the order."
        },
        {
          name: "description",
          documentation: "Description of item and details."
        },
        {
          name: "dTimPlannedStart",
          documentation:
            "The anticipated date and time for the commencement of data delivery."
        },
        {
          name: "dTimPlannedStop",
          documentation:
            "The anticipated date and time for the end of data delivery."
        },
        {
          name: "assetContact",
          documentation: "A list of contact persons for the order.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridAssetContactProperties
        },
        {
          name: "dataSourceConfigurationSet",
          documentation:
            "A list of data configurations for the order. Each configuration contains its own set of ordered channels.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridDataSourceConfigurationSetProperties
        },
        dataGridExtensionNameValue,
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
