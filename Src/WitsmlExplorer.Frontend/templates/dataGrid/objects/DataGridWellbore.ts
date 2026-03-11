import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridWellbore: DataGridProperty = {
  name: "wellbores",
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
      name: "wellbore",
      documentation:
        "Information about a single wellbore. A wellbore is a unique, oriented path from the bottom of a drilled borehole to the surface of the Earth. The path must not overlap or cross itself.",
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
          name: "uid",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation:
            "Unique identifier for the wellbore. This value is only required to be unique within the context of the containing well. The uid attributes of all dependent objects (e.g., trajectory) are only required to be unique within the context the containing wellbore.",
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
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the wellbore."
        },
        {
          name: "parentWellbore",
          required: false,
          baseType: "string",
          witsmlType: "refNameString",
          maxLength: 64,
          documentation:
            "This is a pointer to the parent wellbore. No parent = starts from top.",
          properties: dataGridRefNameStringProperties
        },
        {
          name: "number",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Operator borehole number."
        },
        {
          name: "suffixAPI",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "API suffix."
        },
        {
          name: "numGovt",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Government assigned number."
        },
        {
          name: "statusWellbore",
          required: false,
          baseType: "string",
          witsmlType: "wellStatus",
          maxLength: 50,
          documentation: "POSC wellbore status."
        },
        {
          name: "isActive",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'True (="1" or "true") indicates that the wellbore is active. False (="0" or "false") indicates otherwise. It is the servers responsibility to set this value based on its available internal data (e.g., what objects are changing).'
        },
        {
          name: "purposeWellbore",
          required: false,
          baseType: "string",
          witsmlType: "wellPurpose",
          maxLength: 50,
          documentation: "POSC wellbore purpose."
        },
        {
          name: "typeWellbore",
          required: false,
          baseType: "string",
          witsmlType: "wellboreType",
          maxLength: 50,
          documentation: "Type of wellbore."
        },
        {
          name: "shape",
          required: false,
          baseType: "string",
          witsmlType: "wellboreShape",
          maxLength: 50,
          documentation: "POSC wellbore trajectory shape."
        },
        {
          name: "dTimKickoff",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time of wellbore kickoff."
        },
        {
          name: "achievedTD",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'True ("true" of "1") indicates that the wellbore has acheieved total depth. That is, drilling has completed. False ("false" or "0") indicates otherwise. Not given indicates that it is not known whether total depth has been reached.'
        },
        {
          name: "md",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "The measured depth of the borehole. If status is plugged, indicates the maximum depth reached before plugging. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvd",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation:
            "The true vertical depth of the borehole. If status is plugged, indicates the maximum depth reached before plugging. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdBit",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "The measured depth of the bit. If isActive=false then this value is not relevant. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdBit",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation:
            "The true vertical depth of the bit. If isActive=false then this value is not relevant. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdKickoff",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Kickoff measured depth of the wellbore.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdKickoff",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation: "Kickoff true vertical depth of the wellbore.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdPlanned",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Planned measured depth for the wellbore total depth.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdPlanned",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation:
            "Planned true vertical depth for the wellbore total depth.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdSubSeaPlanned",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "Planned measured for the wellbore total depth - with respect to seabed.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdSubSeaPlanned",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation:
            "Planned true vertical depth for the wellbore total depth - with respect to seabed.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "dayTarget",
          required: false,
          baseType: "double",
          witsmlType: "timeMeasure",
          documentation: "Target days for drilling wellbore.",
          properties: dataGridUomProperties("timeUom")
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
