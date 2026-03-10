import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefObjectStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefObjectStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridRisk: DataGridProperty = {
  name: "risks",
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
      name: "risk",
      documentation: "A single risk.",
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
          documentation: "Unique identifier for the risk.",
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
            "Human recognizable context for the wellbore that contains the risk."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the risk."
        },
        {
          name: "objectReference",
          required: false,
          baseType: "string",
          witsmlType: "refObjectString",
          maxLength: 64,
          documentation:
            "A reference to an object that is defined within the context of the specified wellbore.",
          properties: dataGridRefObjectStringProperties
        },
        {
          name: "type",
          required: true,
          baseType: "string",
          witsmlType: "riskType",
          maxLength: 50,
          documentation: "The type of risk."
        },
        {
          name: "category",
          required: true,
          baseType: "string",
          witsmlType: "riskCategory",
          maxLength: 50,
          documentation: "The category of risk."
        },
        {
          name: "subCategory",
          required: false,
          baseType: "string",
          witsmlType: "riskSubCategory",
          maxLength: 50,
          documentation: "The sub category of risk."
        },
        {
          name: "extendCategory",
          required: false,
          baseType: "string",
          witsmlType: "kindString",
          maxLength: 50,
          documentation: "Custom string to further categorize the risk."
        },
        {
          name: "affectedPersonnel",
          required: false,
          baseType: "string",
          witsmlType: "riskAffectedPersonnel",
          maxLength: 50,
          documentation: "The personnel affected by the risk.",
          isMultiple: true
        },
        {
          name: "dTimStart",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time that activities started."
        },
        {
          name: "dTimEnd",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time that activities were completed."
        },
        {
          name: "mdHoleStart",
          required: false,
          witsmlType: "measuredDepthCoord",
          documentation: "Measured Depth at start of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdHoleEnd",
          required: false,
          witsmlType: "measuredDepthCoord",
          documentation: "Measured Depth at end of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdHoleStart",
          required: false,
          witsmlType: "wellVerticalDepthCoord",
          documentation: "True Vertical Depth at start of activity.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "tvdHoleEnd",
          required: false,
          witsmlType: "wellVerticalDepthCoord",
          documentation: "True Vertical Depth at end of activity.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdBitStart",
          required: false,
          witsmlType: "measuredDepthCoord",
          documentation: "Measured depth of bit at start of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdBitEnd",
          required: false,
          witsmlType: "measuredDepthCoord",
          documentation: "Measured depth of bit at end of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "diaHole",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Hole diameter.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "severityLevel",
          required: false,
          baseType: "int",
          witsmlType: "levelIntegerCode",
          documentation:
            "Severity Level of the Risk. Values of 1 through 5 with 1 being the lowest."
        },
        {
          name: "probabilityLevel",
          required: false,
          baseType: "int",
          witsmlType: "levelIntegerCode",
          documentation:
            "Probability Level of the Risk. Values of 1 through 5 with 1 being the lowest."
        },
        {
          name: "summary",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation: "Summary description of risk."
        },
        {
          name: "details",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation: "Complete description of Risk."
        },
        {
          name: "identification",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation: "Details for identifying the Risk."
        },
        {
          name: "contingency",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation: "Plan of action if the Risk materializes."
        },
        {
          name: "mitigation",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation:
            "Plan of action to ensure the risk does not materialize.",
          isMultiple: true
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
