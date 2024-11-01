import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridGeologyIntervalProperties } from "templates/dataGrid/objects/common/properties/DataGridGeologyIntervalProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridConvCore: DataGridProperty = {
  name: "convCores",
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
      name: "convCore",
      documentation: "A single conventional core.",
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
          documentation: "Unique identifier for the conventional core.",
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
            "Human recognizable context for the wellbore that contains the conventional core."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the conventional core."
        },
        {
          name: "mdCoreTop",
          documentation: "Top depth of core interval.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdCoreBottom",
          documentation: "Bottom depth of core interval.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "dTimCoreStart",
          documentation:
            "Date and time when coring commenced (cutting new core)."
        },
        {
          name: "dTimCoreEnd",
          documentation:
            "Date and time when coring complete (end of cutting new core)."
        },
        {
          name: "coreReference",
          documentation: "Manufacturer core reference."
        },
        {
          name: "coringContractor",
          documentation: "Name of coring contractor."
        },
        {
          name: "analysisContractor",
          documentation: "Name of analysis company."
        },
        {
          name: "coreBarrel",
          documentation: "Core barrel type."
        },
        {
          name: "innerBarrelUsed",
          documentation:
            'Inner barrel used? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "innerBarrelType",
          documentation: "Core inner barrel type."
        },
        {
          name: "lenBarrel",
          documentation: "Length of core barrel.",
          properties: dataGridUomProperties
        },
        {
          name: "coreBitType",
          documentation: "Core bit type."
        },
        {
          name: "diaBit",
          documentation: "Core bit outer diameter.",
          properties: dataGridUomProperties
        },
        {
          name: "diaCore",
          documentation: "Core cut diameter.",
          properties: dataGridUomProperties
        },
        {
          name: "lenCored",
          documentation: "Cored interval length.",
          properties: dataGridUomProperties
        },
        {
          name: "lenRecovered",
          documentation: "Length of core recovered.",
          properties: dataGridUomProperties
        },
        {
          name: "recoverPc",
          documentation: "Calculate recovery (commonly in percent).",
          properties: dataGridUomProperties
        },
        {
          name: "inclHole",
          documentation: "Wellbore inclination over cored interval.",
          properties: dataGridUomProperties
        },
        {
          name: "coreOrientation",
          documentation:
            'True if the core can be re-oriented in space after extraction when a tool-face has been used. Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "coreMethod",
          documentation:
            "Method to catch core - fiberglass barrel, conventional, etc."
        },
        {
          name: "coreTreatmentMethod",
          documentation: "Preservation method description."
        },
        {
          name: "coreFluidUsed",
          documentation: "Mud type in use when cutting core."
        },
        {
          name: "nameFormation",
          documentation: "Name of formation penetrated."
        },
        {
          name: "geologyInterval",
          documentation:
            "Set of Geological intervals, descriptions, gas readings for the cored interval.",
          isContainer: true,
          properties: dataGridGeologyIntervalProperties
        },
        {
          name: "coreDescription",
          documentation: "General core description."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
