import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridChronostratigraphyStructProperties } from "templates/dataGrid/objects/common/properties/DataGridChronostratigraphyStructProperties";
import { dataGridLithostratigraphyStructProperties } from "templates/dataGrid/objects/common/properties/DataGridLithostratigraphyStructProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridFormationMarker: DataGridProperty = {
  name: "formationMarkers",
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
      name: "formationMarker",
      documentation: "A single formation marker.",
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
          documentation: "Unique identifier for the formation marker.",
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
            "Human recognizable context for the wellbore that contains the formation marker."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the formation marker."
        },
        {
          name: "mdPrognosed",
          documentation: "Prognosed measured depth.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdPrognosed",
          documentation: "Prognosed true vertical depth.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdTopSample",
          documentation: "Sampled measured depth at top of marker.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdTopSample",
          documentation: "Sampled true vertical depth at top of marker.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "thicknessBed",
          documentation: "Vertical thickness.",
          properties: dataGridUomProperties
        },
        {
          name: "thicknessApparent",
          documentation: "Formation exposed along the wellbore.",
          properties: dataGridUomProperties
        },
        {
          name: "thicknessPerpen",
          documentation: "True Stratigraphic thickness.",
          properties: dataGridUomProperties
        },
        {
          name: "mdLogSample",
          documentation: "Logged measured depth at top of marker.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdLogSample",
          documentation: "Logged true vertical depth at top of marker.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "dip",
          documentation: "Angle of dip with respect to horizontal.",
          properties: dataGridUomProperties
        },
        {
          name: "dipDirection",
          documentation: "Interpreted downdip direction.",
          properties: dataGridUomProperties
        },
        {
          name: "lithostratigraphic",
          documentation: "Lithostratigraphic classification.",
          properties: dataGridLithostratigraphyStructProperties
        },
        {
          name: "chronostratigraphic",
          documentation: "Chronostratigraphic classification.",
          properties: dataGridChronostratigraphyStructProperties
        },
        {
          name: "nameFormation",
          documentation:
            "DEPRECATED. Formerly defined as name of formation penetrated, now deprecated to be replaced by lithostratigraphic with kind=formation."
        },
        {
          name: "description",
          documentation: "Description of item and details."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
