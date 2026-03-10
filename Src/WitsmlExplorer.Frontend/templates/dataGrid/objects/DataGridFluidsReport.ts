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
          documentation: "Unique identifier for the fluids report.",
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
            "Human recognizable context for the wellbore that contains the fluids report."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the fluids report."
        },
        {
          name: "dTim",
          required: true,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time the information is related to."
        },
        {
          name: "md",
          required: true,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "Along hole measured depth of measurement from the drill datum.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvd",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation: "Vertical depth of the measurements.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "numReport",
          required: false,
          baseType: "int",
          witsmlType: "positiveCount",
          documentation: "Fluids report number."
        },
        {
          name: "fluid",
          required: false,
          witsmlType: "cs_fluid",
          documentation: "A Fluid record.",
          isMultiple: true,
          isContainer: true,
          properties: [
            {
              name: "uid",
              required: false,
              baseType: "string",
              witsmlType: "uidString",
              maxLength: 64,
              documentation: "The unique identifier of the fluid.",
              isAttribute: true
            },
            {
              name: "type",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Description for the type of fluid."
            },
            {
              name: "locationSample",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Sample location."
            },
            {
              name: "dTim",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation: "The time when fluid readings were recorded."
            },
            {
              name: "md",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation:
                "The measured depth where the fluid readings were recorded.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "tvd",
              required: false,
              baseType: "double",
              witsmlType: "wellVerticalDepthCoord",
              documentation:
                "The true vertical depth where the fluid readings were recorded.",
              properties: dataGridWellVerticalDepthCoordProperties
            },
            {
              name: "presBopRating",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation:
                "Maximum pressure rating of the blow out preventer.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "mudClass",
              required: false,
              baseType: "string",
              witsmlType: "mudClass",
              maxLength: 50,
              documentation: "The class of the drilling fluid."
            },
            {
              name: "density",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Fluid density.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "visFunnel",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Funnel viscosity in seconds.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "tempVis",
              required: false,
              baseType: "double",
              witsmlType: "thermodynamicTemperatureMeasure",
              documentation: "Funnel viscosity temperature.",
              properties: dataGridUomProperties("thermodynamicTemperatureUom")
            },
            {
              name: "pv",
              required: false,
              baseType: "double",
              witsmlType: "dynamicViscosityMeasure",
              documentation: "Plastic viscosity.",
              properties: dataGridUomProperties("dynamicViscosityUom")
            },
            {
              name: "yp",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation:
                "Yield point (Bingham and Herschel Bulkley models).",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "gel10Sec",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "10 second gels.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "gel10Min",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "10 minute gels.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "gel30Min",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "30 minute gels.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "filterCakeLtlp",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation:
                "Filter cake thickness at low (normal) temperature and pressure.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "filtrateLtlp",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation:
                "API water loss (low temperature and pressure mud filtrate measurement) (volume per 30min).",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "tempHthp",
              required: false,
              baseType: "double",
              witsmlType: "thermodynamicTemperatureMeasure",
              documentation:
                "High temperature high pressure (HTHP) temperature.",
              properties: dataGridUomProperties("thermodynamicTemperatureUom")
            },
            {
              name: "presHthp",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "High temperature high pressure (HTHP) pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "filtrateHthp",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation:
                "High temperature high pressure (HTHP) filtrate (volume per 30min).",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "filterCakeHthp",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation:
                "High temperature high pressure (HTHP) Filter cake thickness.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "solidsPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation:
                "Solids percentage from retort (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "waterPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Water content (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "oilPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Oil content from retort (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "sandPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Sand content (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "solidsLowGravPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Low gravity solids (%).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "solidsCalcPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation:
                "Solids content (calculated) (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "baritePc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Barite content (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "lcm",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Lost circulation material.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "mbt",
              required: false,
              baseType: "double",
              witsmlType: "equivalentPerMassMeasure",
              documentation:
                "Cation exchange capacity (CEC) of the mud sample as measured by methylene blue titration (MBT).",
              properties: dataGridUomProperties("equivalentPerMassUom")
            },
            {
              name: "ph",
              required: false,
              baseType: "double",
              witsmlType: "unitlessQuantity",
              documentation: "Mud pH."
            },
            {
              name: "tempPh",
              required: false,
              baseType: "double",
              witsmlType: "thermodynamicTemperatureMeasure",
              documentation: "Mud pH measurement temperature.",
              properties: dataGridUomProperties("thermodynamicTemperatureUom")
            },
            {
              name: "pm",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Phenolphthalein alkalinity of whole mud.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "pmFiltrate",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Phenolphthalein alkalinity of mud filtrate.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "mf",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Methyl orange alkalinity of filtrate.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "alkalinityP1",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation:
                "Mud alkalinity P1 from alternate alkalinity method (volume in ml of 0.02N acid to reach the phenolphthalein endpoint).",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "alkalinityP2",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation:
                "Mud alkalinity P2 from alternate alkalinity method (volume in ml of 0.02N acid to titrate the reagent mixture to the phenolphthalein endpoint).",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "chloride",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Chloride content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "calcium",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Calcium content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "magnesium",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Magnesium content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "potassium",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Potassium content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "rheometer",
              required: false,
              witsmlType: "cs_rheometer",
              documentation:
                "One or more sets of rheometer readings at given temperature and pressure.",
              isMultiple: true,
              isContainer: true,
              properties: [
                {
                  name: "uid",
                  required: false,
                  baseType: "string",
                  witsmlType: "uidString",
                  maxLength: 64,
                  documentation: "The unique identifier of the rheometer.",
                  isAttribute: true
                },
                {
                  name: "tempRheom",
                  required: false,
                  baseType: "double",
                  witsmlType: "thermodynamicTemperatureMeasure",
                  documentation: "Rheometer temperature.",
                  properties: dataGridUomProperties(
                    "thermodynamicTemperatureUom"
                  )
                },
                {
                  name: "presRheom",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Rheometer pressure.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "vis3Rpm",
                  required: false,
                  baseType: "double",
                  witsmlType: "unitlessQuantity",
                  documentation: "3 RPM viscometer reading"
                },
                {
                  name: "vis6Rpm",
                  required: false,
                  baseType: "double",
                  witsmlType: "unitlessQuantity",
                  documentation: "6 RPM viscometer reading."
                },
                {
                  name: "vis100Rpm",
                  required: false,
                  baseType: "double",
                  witsmlType: "unitlessQuantity",
                  documentation: "100 RPM viscometer reading."
                },
                {
                  name: "vis200Rpm",
                  required: false,
                  baseType: "double",
                  witsmlType: "unitlessQuantity",
                  documentation: "200 RPM viscometer reading."
                },
                {
                  name: "vis300Rpm",
                  required: false,
                  baseType: "double",
                  witsmlType: "unitlessQuantity",
                  documentation: "300 RPM viscometer reading."
                },
                {
                  name: "vis600Rpm",
                  required: false,
                  baseType: "double",
                  witsmlType: "unitlessQuantity",
                  documentation: "600 RPM viscometer reading."
                },
                dataGridExtensionNameValue
              ]
            },
            {
              name: "brinePc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Brine content (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "lime",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Lime content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "electStab",
              required: false,
              baseType: "double",
              witsmlType: "electricPotentialMeasure",
              documentation:
                "Measurement of the emulsion stability and oil-wetting capability in oil-based muds.",
              properties: dataGridUomProperties("electricPotentialUom")
            },
            {
              name: "calciumChloride",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Calcium chloride content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "company",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Name of company."
            },
            {
              name: "engineer",
              required: false,
              baseType: "string",
              witsmlType: "nameString",
              maxLength: 64,
              documentation: "Engineer name  "
            },
            {
              name: "asg",
              required: false,
              baseType: "double",
              witsmlType: "unitlessQuantity",
              documentation: "Average specific gravity of solids."
            },
            {
              name: "solidsHiGravPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Solids high gravity (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "polymer",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation: "Polymers present in mud system.",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "polyType",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Type of polymers present in mud system."
            },
            {
              name: "solCorPc",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation:
                "Solids corrected for Chloride content (commonly in percent).",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "oilCtg",
              required: false,
              baseType: "double",
              witsmlType: "massConcentrationMeasure",
              documentation: "Oil on Cuttings.",
              properties: dataGridUomProperties("massConcentrationUom")
            },
            {
              name: "hardnessCa",
              required: false,
              baseType: "double",
              witsmlType: "massConcentrationMeasure",
              documentation: "Total calcium hardness.",
              properties: dataGridUomProperties("massConcentrationUom")
            },
            {
              name: "sulfide",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Sulfide content.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "comments",
              required: false,
              baseType: "string",
              witsmlType: "commentString",
              maxLength: 4000,
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
