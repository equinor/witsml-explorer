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
          required: false,
          baseType: "string",
          witsmlType: "uidParentString",
          maxLength: 64,
          documentation:
            "Unique identifier for the well. This uniquely represents the well referenced by the (possibly non-unique) nameWell.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          required: false,
          baseType: "string",
          witsmlType: "uidParentString",
          maxLength: 64,
          documentation:
            "Unique identifier for the wellbore. This uniquely represents the wellbore referenced by the (possibly non-unique) nameWellbore.",
          isAttribute: true
        },
        {
          name: "uid",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation: "Unique identifier for the data order.",
          isAttribute: true
        },
        {
          name: "dwoVersion",
          required: true,
          baseType: "string",
          witsmlType: "dwoVersionString",
          maxLength: 32,
          documentation:
            "Semantic version of the DataWorkOrder schema. Not to be confused with the WITSML version or DataSourceConfiguration versionNumber.",
          isAttribute: true
        },
        {
          name: "nameWell",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable context for the well that contains the wellbore."
        },
        {
          name: "nameWellbore",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable context for the wellbore that contains the data work order."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the data work order."
        },
        {
          name: "field",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of the field the order applies to."
        },
        {
          name: "dataProvider",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "The entity responsible for delivering the data specified in the order."
        },
        {
          name: "dataConsumer",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "The entity that orders and consumes the data as defined in the order."
        },
        {
          name: "description",
          required: false,
          baseType: "string",
          witsmlType: "commentString",
          maxLength: 4000,
          documentation: "Description of item and details."
        },
        {
          name: "dTimPlannedStart",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "The anticipated date and time for the commencement of data delivery."
        },
        {
          name: "dTimPlannedStop",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "The anticipated date and time for the end of data delivery."
        },
        {
          name: "assetContact",
          required: false,
          witsmlType: "cs_dataWorkOrderAssetContact",
          documentation: "A list of contact persons for the order.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridAssetContactProperties
        },
        {
          name: "dataSourceConfigurationSet",
          required: false,
          witsmlType: "cs_dataSourceConfigurationSet",
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
