import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridWbGeometry: DataGridProperty = {
  name: "wbGeometrys",
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
      name: "wbGeometry",
      documentation: "A single wellbore geometry.",
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
          documentation: "Unique identifier for the wellbore geometry.",
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
            "Human recognizable context for the wellbore that contains the wellbore geometry."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the wellbore geometry."
        },
        {
          name: "dTimReport",
          documentation: "Time report generated."
        },
        {
          name: "mdBottom",
          documentation: "Measured depth at bottom.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "gapAir",
          documentation: "Air gap.",
          properties: dataGridUomProperties
        },
        {
          name: "depthWaterMean",
          documentation: "Water depth.",
          properties: dataGridUomProperties
        },
        {
          name: "wbGeometrySection",
          documentation: "Wellbore geometry section object.",
          isContainer: true,
          isMultiple: true,
          properties: [
            {
              name: "uid",
              documentation:
                "Unique identifier for the wellbore geometry section.",
              isAttribute: true
            },
            {
              name: "typeHoleCasing",
              documentation: "Type of fixed component."
            },
            {
              name: "mdTop",
              documentation: "Measured depth at Top of Interval.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdBottom",
              documentation: "Measured depth at bottom of the section.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "tvdTop",
              documentation: "True vertical depth at top of the section.",
              properties: dataGridWellVerticalDepthCoordProperties
            },
            {
              name: "tvdBottom",
              documentation: "True vertical depth at bottom of the section.",
              properties: dataGridWellVerticalDepthCoordProperties
            },
            {
              name: "idSection",
              documentation: "Inner diameter.",
              properties: dataGridUomProperties
            },
            {
              name: "odSection",
              documentation: "Outer diameter - Only for casings and risers.",
              properties: dataGridUomProperties
            },
            {
              name: "wtPerLen",
              documentation: "Weight per unit length for casing sections.",
              properties: dataGridUomProperties
            },
            {
              name: "grade",
              documentation: "Material grade for the tubular section."
            },
            {
              name: "curveConductor",
              documentation:
                'Curved conductor? Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "diaDrift",
              documentation: "Maximum diameter that can pass through.",
              properties: dataGridUomProperties
            },
            {
              name: "factFric",
              documentation: "Friction factor."
            },
            dataGridExtensionNameValue
          ]
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
