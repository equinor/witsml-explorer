import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridFluidsReport: DataGridProperty = {
  name: "fluidsReports",
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
      name: "fluidsReport",
      documentation: "A single fluids report.",
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
          documentation: "Unique identifier for the fluids report.",
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
            "Human recognizable context for the wellbore that contains the fluids report."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the fluids report."
        },
        {
          name: "dTim",
          documentation: "Date and time the information is related to."
        },
        {
          name: "md",
          documentation:
            "Along hole measured depth of measurement from the drill datum.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvd",
          documentation: "Vertical depth of the measurements.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "numReport",
          documentation: "Fluids report number."
        },
        {
          name: "fluid",
          documentation: "A Fluid record.",
          isMultiple: true,
          isContainer: true,
          properties: [
            {
              name: "uid",
              documentation: "The unique identifier of the fluid.",
              isAttribute: true
            },
            {
              name: "type",
              documentation: "Description for the type of fluid."
            },
            {
              name: "locationSample",
              documentation: "Sample location."
            },
            {
              name: "dTim",
              documentation: "The time when fluid readings were recorded."
            },
            {
              name: "md",
              documentation:
                "The measured depth where the fluid readings were recorded.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "tvd",
              documentation:
                "The true vertical depth where the fluid readings were recorded.",
              properties: dataGridWellVerticalDepthCoordProperties
            },
            {
              name: "presBopRating",
              documentation:
                "Maximum pressure rating of the blow out preventer.",
              properties: dataGridUomProperties
            },
            {
              name: "mudClass",
              documentation: "The class of the drilling fluid."
            },
            {
              name: "density",
              documentation: "Fluid density.",
              properties: dataGridUomProperties
            },
            {
              name: "visFunnel",
              documentation: "Funnel viscosity in seconds.",
              properties: dataGridUomProperties
            },
            {
              name: "tempVis",
              documentation: "Funnel viscosity temperature.",
              properties: dataGridUomProperties
            },
            {
              name: "pv",
              documentation: "Plastic viscosity.",
              properties: dataGridUomProperties
            },
            {
              name: "yp",
              documentation:
                "Yield point (Bingham and Herschel Bulkley models).",
              properties: dataGridUomProperties
            },
            {
              name: "gel10Sec",
              documentation: "10 second gels.",
              properties: dataGridUomProperties
            },
            {
              name: "gel10Min",
              documentation: "10 minute gels.",
              properties: dataGridUomProperties
            },
            {
              name: "gel30Min",
              documentation: "30 minute gels.",
              properties: dataGridUomProperties
            },
            {
              name: "filterCakeLtlp",
              documentation:
                "Filter cake thickness at low (normal) temperature and pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "filtrateLtlp",
              documentation:
                "API water loss (low temperature and pressure mud filtrate measurement) (volume per 30min).",
              properties: dataGridUomProperties
            },
            {
              name: "tempHthp",
              documentation:
                "High temperature high pressure (HTHP) temperature.",
              properties: dataGridUomProperties
            },
            {
              name: "presHthp",
              documentation: "High temperature high pressure (HTHP) pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "filtrateHthp",
              documentation:
                "High temperature high pressure (HTHP) filtrate (volume per 30min).",
              properties: dataGridUomProperties
            },
            {
              name: "filterCakeHthp",
              documentation:
                "High temperature high pressure (HTHP) Filter cake thickness.",
              properties: dataGridUomProperties
            },
            {
              name: "solidsPc",
              documentation:
                "Solids percentage from retort (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "waterPc",
              documentation: "Water content (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "oilPc",
              documentation: "Oil content from retort (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "sandPc",
              documentation: "Sand content (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "solidsLowGravPc",
              documentation: "Low gravity solids (%).",
              properties: dataGridUomProperties
            },
            {
              name: "solidsCalcPc",
              documentation:
                "Solids content (calculated) (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "baritePc",
              documentation: "Barite content (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "lcm",
              documentation: "Lost circulation material.",
              properties: dataGridUomProperties
            },
            {
              name: "mbt",
              documentation:
                "Cation exchange capacity (CEC) of the mud sample as measured by methylene blue titration (MBT).",
              properties: dataGridUomProperties
            },
            {
              name: "ph",
              documentation: "Mud pH."
            },
            {
              name: "tempPh",
              documentation: "Mud pH measurement temperature.",
              properties: dataGridUomProperties
            },
            {
              name: "pm",
              documentation: "Phenolphthalein alkalinity of whole mud.",
              properties: dataGridUomProperties
            },
            {
              name: "pmFiltrate",
              documentation: "Phenolphthalein alkalinity of mud filtrate.",
              properties: dataGridUomProperties
            },
            {
              name: "mf",
              documentation: "Methyl orange alkalinity of filtrate.",
              properties: dataGridUomProperties
            },
            {
              name: "alkalinityP1",
              documentation:
                "Mud alkalinity P1 from alternate alkalinity method (volume in ml o",
              properties: dataGridUomProperties
            },
            {
              name: "alkalinityP2",
              documentation:
                "Mud alkalinity P2 from alternate alkalinity method (volume in ml o",
              properties: dataGridUomProperties
            },
            {
              name: "chloride",
              documentation: "Chloride content.",
              properties: dataGridUomProperties
            },
            {
              name: "calcium",
              documentation: "Calcium content.",
              properties: dataGridUomProperties
            },
            {
              name: "magnesium",
              documentation: "Magnesium content.",
              properties: dataGridUomProperties
            },
            {
              name: "potassium",
              documentation: "Potassium content.",
              properties: dataGridUomProperties
            },
            {
              name: "rheometer",
              documentation:
                "One or more sets of rheometer readings at given temperature and pressure.",
              isMultiple: true,
              isContainer: true,
              properties: [
                {
                  name: "uid",
                  documentation: "The unique identifier of the rheometer.",
                  isAttribute: true
                },
                {
                  name: "tempRheom",
                  documentation: "Rheometer temperature.",
                  properties: dataGridUomProperties
                },
                {
                  name: "presRheom",
                  documentation: "Rheometer pressure.",
                  properties: dataGridUomProperties
                },
                {
                  name: "vis3Rpm",
                  documentation: "3 RPM viscometer reading"
                },
                {
                  name: "vis6Rpm",
                  documentation: "6 RPM viscometer reading."
                },
                {
                  name: "vis100Rpm",
                  documentation: "100 RPM viscometer reading."
                },
                {
                  name: "vis200Rpm",
                  documentation: "200 RPM viscometer reading."
                },
                {
                  name: "vis300Rpm",
                  documentation: "300 RPM viscometer reading."
                },
                {
                  name: "vis600Rpm",
                  documentation: "600 RPM viscometer reading."
                },
                dataGridExtensionNameValue
              ]
            },
            {
              name: "brinePc",
              documentation: "Brine content (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "lime",
              documentation: "Lime content.",
              properties: dataGridUomProperties
            },
            {
              name: "electStab",
              documentation:
                "Measurement of the emulsion stability and oil-wetting capability in oil-based muds.",
              properties: dataGridUomProperties
            },
            {
              name: "calciumChloride",
              documentation: "Calcium chloride content.",
              properties: dataGridUomProperties
            },
            {
              name: "company",
              documentation: "Name of company."
            },
            {
              name: "engineer",
              documentation: "Engineer name  "
            },
            {
              name: "asg",
              documentation: "Average specific gravity of solids."
            },
            {
              name: "solidsHiGravPc",
              documentation: "Solids high gravity (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "polymer",
              documentation: "Polymers present in mud system.",
              properties: dataGridUomProperties
            },
            {
              name: "polyType",
              documentation: "Type of polymers present in mud system."
            },
            {
              name: "solCorPc",
              documentation:
                "Solids corrected for Chloride content (commonly in percent).",
              properties: dataGridUomProperties
            },
            {
              name: "oilCtg",
              documentation: "Oil on Cuttings.",
              properties: dataGridUomProperties
            },
            {
              name: "hardnessCa",
              documentation: "Total calcium hardness.",
              properties: dataGridUomProperties
            },
            {
              name: "sulfide",
              documentation: "Sulfide content.",
              properties: dataGridUomProperties
            },
            {
              name: "comments",
              documentation: "Comments and remarks."
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
