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
          documentation: "Unique identifier for the conventional core.",
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
            "Human recognizable context for the wellbore that contains the conventional core."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the conventional core."
        },
        {
          name: "mdCoreTop",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Top depth of core interval.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdCoreBottom",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Bottom depth of core interval.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "dTimCoreStart",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "Date and time when coring commenced (cutting new core)."
        },
        {
          name: "dTimCoreEnd",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "Date and time when coring complete (end of cutting new core)."
        },
        {
          name: "coreReference",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Manufacturer core reference."
        },
        {
          name: "coringContractor",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of coring contractor."
        },
        {
          name: "analysisContractor",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of analysis company."
        },
        {
          name: "coreBarrel",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Core barrel type."
        },
        {
          name: "innerBarrelUsed",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Inner barrel used? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "innerBarrelType",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Core inner barrel type."
        },
        {
          name: "lenBarrel",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Length of core barrel.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "coreBitType",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Core bit type."
        },
        {
          name: "diaBit",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Core bit outer diameter.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "diaCore",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Core cut diameter.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "lenCored",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Cored interval length.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "lenRecovered",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Length of core recovered.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "recoverPc",
          required: false,
          baseType: "double",
          witsmlType: "volumePerVolumeMeasure",
          documentation: "Calculate recovery (commonly in percent).",
          properties: dataGridUomProperties("volumePerVolumeUom")
        },
        {
          name: "inclHole",
          required: false,
          baseType: "double",
          witsmlType: "planeAngleMeasure",
          documentation: "Wellbore inclination over cored interval.",
          properties: dataGridUomProperties("planeAngleUom")
        },
        {
          name: "coreOrientation",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'True if the core can be re-oriented in space after extraction when a tool-face has been used. Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "coreMethod",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation:
            "Method to catch core - fiberglass barrel, conventional, etc."
        },
        {
          name: "coreTreatmentMethod",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Preservation method description."
        },
        {
          name: "coreFluidUsed",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Mud type in use when cutting core."
        },
        {
          name: "nameFormation",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of formation penetrated."
        },
        {
          name: "geologyInterval",
          required: false,
          witsmlType: "cs_geologyInterval",
          documentation:
            "Set of Geological intervals, descriptions, gas readings for the cored interval.",
          isContainer: true,
          properties: dataGridGeologyIntervalProperties
        },
        {
          name: "coreDescription",
          required: false,
          baseType: "string",
          witsmlType: "commentString",
          maxLength: 4000,
          documentation: "General core description."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
