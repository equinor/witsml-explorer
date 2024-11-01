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
          documentation: "Unique identifier for the risk.",
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
            "Human recognizable context for the wellbore that contains the risk."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the risk."
        },
        {
          name: "objectReference",
          documentation:
            "A reference to an object that is defined within the context of the specified wellbore.",
          properties: dataGridRefObjectStringProperties
        },
        {
          name: "type",
          documentation: "The type of risk."
        },
        {
          name: "category",
          documentation: "The category of risk."
        },
        {
          name: "subCategory",
          documentation: "The sub category of risk."
        },
        {
          name: "extendCategory",
          documentation: "Custom string to further categorize the risk."
        },
        {
          name: "affectedPersonnel",
          documentation: "The personnel affected by the risk."
        },
        {
          name: "dTimStart",
          documentation: "Date and time that activities started."
        },
        {
          name: "dTimEnd",
          documentation: "Date and time that activities were completed."
        },
        {
          name: "mdHoleStart",
          documentation: "Measured Depth at start of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdHoleEnd",
          documentation: "Measured Depth at end of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdHoleStart",
          documentation: "True Vertical Depth at start of activity.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "tvdHoleEnd",
          documentation: "True Vertical Depth at end of activity.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdBitStart",
          documentation: "Measured depth of bit at start of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdBitEnd",
          documentation: "Measured depth of bit at end of activity.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "diaHole",
          documentation: "Hole diameter.",
          properties: dataGridUomProperties
        },
        {
          name: "severityLevel",
          documentation:
            "Severity Level of the Risk. Values of 1 through 5 with 1 being the lowest."
        },
        {
          name: "probabilityLevel",
          documentation:
            "Probability Level of the Risk. Values of 1 through 5 with 1 being the lowest."
        },
        {
          name: "summary",
          documentation: "Summary description of risk."
        },
        {
          name: "details",
          documentation: "Complete description of Risk."
        },
        {
          name: "identification",
          documentation: "Details for identifying the Risk."
        },
        {
          name: "contingency",
          documentation: "Plan of action if the Risk materializes."
        },
        {
          name: "mitigation",
          documentation:
            "Plan of action to ensure the risk does not materialize."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
