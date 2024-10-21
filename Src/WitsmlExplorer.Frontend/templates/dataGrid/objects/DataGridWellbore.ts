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
          documentation:
            "Unique identifier for the well. This uniquely represents the well referenced by the (possibly non-unique) nameWell.",
          isAttribute: true
        },
        {
          name: "uid",
          documentation:
            "Unique identifier for the wellbore. This value is only required to be unique within the context of the containing well. The uid attributes of all dependent objects (e.g., trajectory) are only required to be unique within the context the containing wellbore.",
          isAttribute: true
        },
        {
          name: "nameWell",
          documentation:
            "Human recognizable context for the well that contains the wellbore."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the wellbore."
        },
        {
          name: "parentWellbore",
          documentation:
            "This is a pointer to the parent wellbore. No parent = starts from top.",
          properties: dataGridRefNameStringProperties
        },
        {
          name: "number",
          documentation: "Operator borehole number."
        },
        {
          name: "suffixAPI",
          documentation: "API suffix."
        },
        {
          name: "numGovt",
          documentation: "Government assigned number."
        },
        {
          name: "statusWellbore",
          documentation: "POSC wellbore status."
        },
        {
          name: "isActive",
          documentation:
            'True (="1" or "true") indicates that the wellbore is active. False (="0" or "false") indicates otherwise. It is the servers responsibility to set this value based on its available internal data (e.g., what objects are changing).'
        },
        {
          name: "purposeWellbore",
          documentation: "POSC wellbore purpose."
        },
        {
          name: "typeWellbore",
          documentation: "Type of wellbore."
        },
        {
          name: "shape",
          documentation: "POSC wellbore trajectory shape."
        },
        {
          name: "dTimKickoff",
          documentation: "Date and time of wellbore kickoff."
        },
        {
          name: "achievedTD",
          documentation:
            'True ("true" of "1") indicates that the wellbore has acheieved total depth. That is, drilling has completed. False ("false" or "0") indicates otherwise. Not given indicates that it is not known whether total depth has been reached.'
        },
        {
          name: "md",
          documentation:
            "The measured depth of the borehole. If status is plugged, indicates the maximum depth reached before plugging. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvd",
          documentation:
            "The true vertical depth of the borehole. If status is plugged, indicates the maximum depth reached before plugging. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdBit",
          documentation:
            "The measured depth of the bit. If isActive=false then this value is not relevant. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdBit",
          documentation:
            "The true vertical depth of the bit. If isActive=false then this value is not relevant. It is recommended that this value be updated about every 10 minutes by an assigned raw data provider at a site.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdKickoff",
          documentation: "Kickoff measured depth of the wellbore.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdKickoff",
          documentation: "Kickoff true vertical depth of the wellbore.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdPlanned",
          documentation: "Planned measured depth for the wellbore total depth.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdPlanned",
          documentation:
            "Planned true vertical depth for the wellbore total depth.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdSubSeaPlanned",
          documentation:
            "Planned measured for the wellbore total depth - with respect to seabed.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdSubSeaPlanned",
          documentation:
            "Planned true vertical depth for the wellbore total depth - with respect to seabed.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "dayTarget",
          documentation: "Target days for drilling wellbore.",
          properties: dataGridUomProperties
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
