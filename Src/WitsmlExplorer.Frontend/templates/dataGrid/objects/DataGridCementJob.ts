import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridGrpWbGeometryProperties } from "templates/dataGrid/objects/common/properties/DataGridGrpWbGeometryProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridCementJob: DataGridProperty = {
  name: "cementJobs",
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
      name: "cementJob",
      documentation: "A single cement job.",
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
          documentation: "Unique identifier for the cement job.",
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
            "Human recognizable context for the wellbore that contains the cement job."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the cement job."
        },
        {
          name: "jobType",
          required: false,
          baseType: "string",
          witsmlType: "cementJobType",
          maxLength: 50,
          documentation: "Type of cement job."
        },
        {
          name: "jobConfig",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation: "Job configuration."
        },
        {
          name: "dTimJob",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time of Cement Job."
        },
        {
          name: "nameCementedString",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Name for the cemented string  "
        },
        {
          name: "holeConfig",
          baseType: "string",
          required: false,
          witsmlType: "cs_wbGeometry",
          documentation: "Wellbore Geometry of annulus.",
          isContainer: true,
          properties: dataGridGrpWbGeometryProperties
        },
        {
          name: "nameWorkString",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name for the cement work string  "
        },
        {
          name: "contractor",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of cementing contractor."
        },
        {
          name: "cementEngr",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Cementing engineer."
        },
        {
          name: "offshoreJob",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Offshore job? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "mdWater",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation:
            "Water depth if offshore. The distance from mean sea level to water bottom.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "returnsToSeabed",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Returns to seabed? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "reciprocating",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Pipe being reciprocated.  Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "woc",
          required: false,
          baseType: "double",
          witsmlType: "timeMeasure",
          documentation: "Duration for waiting on cement to set.",
          properties: dataGridUomProperties("timeUom")
        },
        {
          name: "mdPlugTop",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "If Plug, measured depth of top of plug.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdPlugBot",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "If Plug, measured depth of bottom of plug.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdHole",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Measured depth at bottom of hole.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdShoe",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Measured depth of previous shoe.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdShoe",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation: "True Vertical Depth of previous shoe.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdStringSet",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Measured depth of cement string shoe.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdStringSet",
          required: false,
          baseType: "double",
          witsmlType: "wellVerticalDepthCoord",
          documentation: "True vertical depth of cement string shoe.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "cementStage",
          required: false,
          witsmlType: "cs_cementStage",
          documentation: "Set of stages for the job (usually 1 or 2).",
          isContainer: true,
          isMultiple: true,
          properties: [
            {
              name: "uid",
              required: false,
              baseType: "string",
              witsmlType: "uidString",
              maxLength: 64,
              documentation: "Unique identifier for the stage.",
              isAttribute: true
            },
            {
              name: "numStage",
              required: true,
              baseType: "int",
              witsmlType: "positiveCount",
              documentation: "Stage number."
            },
            {
              name: "typeStage",
              required: true,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Stage type."
            },
            {
              name: "dTimMixStart",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation: "Date and time when mixing started."
            },
            {
              name: "dTimPumpStart",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation: "Datetime at start of pumping cement."
            },
            {
              name: "dTimPumpEnd",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation: "Datetime at end of pumping cement."
            },
            {
              name: "dTimDisplaceStart",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation: "Date and time when displacing cement started."
            },
            {
              name: "mdTop",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth at top of interval.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdBottom",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth of base of cement.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "volExcess",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Excess volume.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "flowrateDisplaceAv",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Average displacement rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "flowrateDisplaceMx",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Maximum displacement rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "presDisplace",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Final displacement pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "volReturns",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Volume of returns.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "eTimMudCirculation",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Mud circulation elapsed time before the job.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "flowrateMudCirc",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Rate mud circulated during stage.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "presMudCirc",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Mud circulation pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "flowrateEnd",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Final displacement pump rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "cementingFluid",
              required: false,
              baseType: "string",
              witsmlType: "cs_cementingFluid",
              documentation:
                "Displaced Mud, washes and spacers, cements, displacement mud.",
              isContainer: true,
              properties: [
                {
                  name: "typeFluid",
                  required: false,
                  baseType: "string",
                  witsmlType: "str16",
                  maxLength: 16,
                  documentation: "Fluid type: Mud, Wash, Spacer, Slurry."
                },
                {
                  name: "fluidIndex",
                  required: false,
                  baseType: "int",
                  witsmlType: "positiveCount",
                  documentation:
                    "Fluid Index: 1: first fluid pumped (=original mud), (last-1)=Tail cement, last= displacement mud"
                },
                {
                  name: "descFluid",
                  required: false,
                  baseType: "string",
                  witsmlType: "shortDescriptionString",
                  maxLength: 64,
                  documentation: "Fluid description."
                },
                {
                  name: "purpose",
                  required: false,
                  baseType: "string",
                  witsmlType: "str32",
                  maxLength: 32,
                  documentation: "Purpose description."
                },
                {
                  name: "classSlurryDryBlend",
                  required: false,
                  baseType: "string",
                  witsmlType: "str16",
                  maxLength: 16,
                  documentation: "Slurry class."
                },
                {
                  name: "mdFluidTop",
                  required: false,
                  baseType: "double",
                  witsmlType: "measuredDepthCoord",
                  documentation: "Measured depth at top of slurry placement.",
                  properties: dataGridMeasuredDepthCoordProperties
                },
                {
                  name: "mdFluidBottom",
                  required: false,
                  baseType: "double",
                  witsmlType: "measuredDepthCoord",
                  documentation:
                    "Measured depth at bottom of slurry placement.",
                  properties: dataGridMeasuredDepthCoordProperties
                },
                {
                  name: "sourceWater",
                  required: false,
                  baseType: "string",
                  witsmlType: "str32",
                  maxLength: 32,
                  documentation: "Water Source Description."
                },
                {
                  name: "volWater",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Water volume.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "volCement",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Volume of cement.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "ratioMixWater",
                  required: false,
                  baseType: "double",
                  witsmlType: "specificVolumeMeasure",
                  documentation: "Mix Water Ratio.",
                  properties: dataGridUomProperties("specificVolumeUom")
                },
                {
                  name: "volFluid",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Fluid/Slurry Volume.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "cementPumpSchedule",
                  required: false,
                  baseType: "string",
                  witsmlType: "cs_cementPumpSchedule",
                  documentation: "Set of (Time / Rate / Back Pressure).",
                  isContainer: true,
                  properties: [
                    {
                      name: "eTimPump",
                      required: false,
                      baseType: "double",
                      witsmlType: "timeMeasure",
                      documentation:
                        "(Elapsed time period during the fluid is pumped.",
                      properties: dataGridUomProperties("timeUom")
                    },
                    {
                      name: "ratePump",
                      required: false,
                      baseType: "double",
                      witsmlType: "volumeFlowRateMeasure",
                      documentation:
                        "Rate fluid is pumped. 0 means it is a pause.",
                      properties: dataGridUomProperties("volumeFlowRateUom")
                    },
                    {
                      name: "volPump",
                      required: false,
                      baseType: "double",
                      witsmlType: "volumeMeasure",
                      documentation: "Volume pumped = eTimPump * ratePump.",
                      properties: dataGridUomProperties("volumeUom")
                    },
                    {
                      name: "strokePump",
                      required: false,
                      baseType: "int",
                      witsmlType: "nonNegativeCount",
                      documentation:
                        "Number of pump strokes for the fluid to be pumped (assumes pump output known)."
                    },
                    {
                      name: "presBack",
                      required: false,
                      baseType: "double",
                      witsmlType: "pressureMeasure",
                      documentation:
                        "Back pressure applied during pumping stage.",
                      properties: dataGridUomProperties("pressureUom")
                    },
                    {
                      name: "eTimShutdown",
                      required: false,
                      baseType: "double",
                      witsmlType: "timeMeasure",
                      documentation:
                        "If shutdown event, the elapsed time duration.",
                      properties: dataGridUomProperties("timeUom")
                    },
                    {
                      name: "comments",
                      required: false,
                      baseType: "string",
                      witsmlType: "commentString",
                      maxLength: 4000,
                      documentation: "Comments and Remarks."
                    }
                  ]
                },
                {
                  name: "excessPc",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumePerVolumeMeasure",
                  documentation: "Excess Percent.",
                  properties: dataGridUomProperties("volumePerVolumeUom")
                },
                {
                  name: "volYield",
                  required: false,
                  baseType: "double",
                  witsmlType: "specificVolumeMeasure",
                  documentation: "Slurry Yield.",
                  properties: dataGridUomProperties("specificVolumeUom")
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
                  name: "solidVolumeFraction",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumePerVolumeMeasure",
                  documentation: "Equals 1 - Porosity.",
                  properties: dataGridUomProperties("volumePerVolumeUom")
                },
                {
                  name: "volPumped",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Volume Pumped.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "volOther",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Other Volume.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "fluidRheologicalModel",
                  required: false,
                  baseType: "string",
                  witsmlType: "str16",
                  maxLength: 16,
                  documentation: "Newtonian/Bingham/Power Law/Herschel Bulkley."
                },
                {
                  name: "vis",
                  required: false,
                  baseType: "double",
                  witsmlType: "dynamicViscosityMeasure",
                  documentation:
                    "Viscosity (Newtonian) or Plastic Viscosity if Bingham.",
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
                  name: "n",
                  required: false,
                  baseType: "double",
                  witsmlType: "dimensionlessMeasure",
                  documentation: "Power Law index (Power Law and HB).",
                  properties: dataGridUomProperties("dimensionlessUom")
                },
                {
                  name: "k",
                  required: false,
                  baseType: "double",
                  witsmlType: "dimensionlessMeasure",
                  documentation: "Consistency index (Power Law and HB).",
                  properties: dataGridUomProperties("dimensionlessUom")
                },
                {
                  name: "gel10SecReading",
                  required: false,
                  baseType: "double",
                  witsmlType: "planeAngleMeasure",
                  documentation: "Gel reading after 10 seconds.",
                  properties: dataGridUomProperties("planeAngleUom")
                },
                {
                  name: "gel10SecStrength",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Gel strength after 10 seconds.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "gel1MinReading",
                  required: false,
                  baseType: "double",
                  witsmlType: "planeAngleMeasure",
                  documentation: "Gel reading after 1 minute.",
                  properties: dataGridUomProperties("planeAngleUom")
                },
                {
                  name: "gel1MinStrength",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Gel strength after 1 minute.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "gel10MinReading",
                  required: false,
                  baseType: "double",
                  witsmlType: "planeAngleMeasure",
                  documentation: "Gel reading after 10 minutes.",
                  properties: dataGridUomProperties("planeAngleUom")
                },
                {
                  name: "gel10MinStrength",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Gel strength after 10 minutes.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "typeBaseFluid",
                  required: false,
                  baseType: "string",
                  witsmlType: "str16",
                  maxLength: 16,
                  documentation:
                    "Type of base fluid: Fresh water, Sea water, Brine, Brackish water."
                },
                {
                  name: "densBaseFluid",
                  required: false,
                  baseType: "double",
                  witsmlType: "densityMeasure",
                  documentation: "Density of base fluid.",
                  properties: dataGridUomProperties("densityUom")
                },
                {
                  name: "dryBlendName",
                  required: false,
                  baseType: "string",
                  witsmlType: "str32",
                  maxLength: 32,
                  documentation: "Name of dry blend."
                },
                {
                  name: "dryBlendDescription",
                  required: false,
                  baseType: "string",
                  witsmlType: "shortDescriptionString",
                  maxLength: 64,
                  documentation: "Description of dry blend."
                },
                {
                  name: "massDryBlend",
                  required: false,
                  baseType: "double",
                  witsmlType: "massMeasure",
                  documentation:
                    "Mass of dry blend: the blend is made of different solid additives: the volume is not constant.",
                  properties: dataGridUomProperties("massUom")
                },
                {
                  name: "densDryBlend",
                  required: false,
                  baseType: "double",
                  witsmlType: "densityMeasure",
                  documentation: "Density of Dry blend.",
                  properties: dataGridUomProperties("densityUom")
                },
                {
                  name: "massSackDryBlend",
                  required: false,
                  baseType: "double",
                  witsmlType: "massMeasure",
                  documentation: "Weight of a sack of dry blend.",
                  properties: dataGridUomProperties("massUom")
                },
                {
                  name: "cementAdditive",
                  required: false,
                  baseType: "string",
                  witsmlType: "cs_cementAdditive",
                  documentation:
                    "Additives can be added in slurry but also in spacers, washes, mud.",
                  isContainer: true,
                  isMultiple: true,
                  properties: [
                    {
                      name: "uid",
                      required: false,
                      baseType: "string",
                      witsmlType: "uidString",
                      maxLength: 64,
                      documentation: "Unique identifier for the additive.",
                      isAttribute: true
                    },
                    {
                      name: "nameAdd",
                      required: true,
                      baseType: "string",
                      witsmlType: "str32",
                      maxLength: 32,
                      documentation: "Additive name."
                    },
                    {
                      name: "typeAdd",
                      required: false,
                      baseType: "string",
                      witsmlType: "str32",
                      maxLength: 32,
                      documentation:
                        "Additive type or Function (Retarder, Visosifier, Weighting agent)."
                    },
                    {
                      name: "formAdd",
                      required: false,
                      baseType: "string",
                      witsmlType: "str16",
                      maxLength: 16,
                      documentation: "Wet or Dry."
                    },
                    {
                      name: "densAdd",
                      required: false,
                      baseType: "double",
                      witsmlType: "densityMeasure",
                      documentation: "Additive density.",
                      properties: dataGridUomProperties("densityUom")
                    },
                    {
                      name: "typeConc",
                      required: true,
                      baseType: "string",
                      witsmlType: "str16",
                      maxLength: 16,
                      documentation:
                        "ConcentrationType: %BWOC (%By weight of Cement), %BWOB (%By weight of blend), %BWOW (%By weight of water), %BWOBF (%By weight of base fluid)"
                    },
                    {
                      name: "concentration",
                      required: true,
                      baseType: "double",
                      witsmlType: "massConcentrationMeasure",
                      documentation:
                        "Concentration Amount: unit type depends of typeConc.",
                      properties: dataGridUomProperties("massConcentrationUom")
                    },
                    {
                      name: "wtSack",
                      required: true,
                      baseType: "double",
                      witsmlType: "massMeasure",
                      documentation:
                        "Concentration in terms of weight per sack.",
                      properties: dataGridUomProperties("massUom")
                    },
                    {
                      name: "volSack",
                      required: true,
                      baseType: "double",
                      witsmlType: "volumeMeasure",
                      documentation:
                        "Concentration in terms of volume per sack.",
                      properties: dataGridUomProperties("volumeUom")
                    },
                    {
                      name: "additive",
                      required: true,
                      baseType: "double",
                      witsmlType: "massMeasure",
                      documentation: "Additive Amount.",
                      properties: dataGridUomProperties("massUom")
                    },
                    dataGridExtensionNameValue
                  ]
                },
                {
                  name: "foamUsed",
                  required: false,
                  baseType: "boolean",
                  witsmlType: "logicalBoolean",
                  documentation:
                    'Foam used indicator.  Values are "true" (or "1") and "false" (or "0").'
                },
                {
                  name: "typeGasFoam",
                  required: false,
                  baseType: "string",
                  witsmlType: "str32",
                  maxLength: 32,
                  documentation: "Gas type used for foam job."
                },
                {
                  name: "volGasFoam",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Volume of gas used for foam job.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "ratioConstGasMethodAv",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumePerVolumeMeasure",
                  documentation: "Constant gas ratio method ratio  ",
                  properties: dataGridUomProperties("volumePerVolumeUom")
                },
                {
                  name: "densConstGasMethod",
                  required: false,
                  baseType: "double",
                  witsmlType: "densityMeasure",
                  documentation: "Constant gas ratio method average density.",
                  properties: dataGridUomProperties("densityUom")
                },
                {
                  name: "ratioConstGasMethodStart",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumePerVolumeMeasure",
                  documentation:
                    "Constant gas ratio method initial method ratio.",
                  properties: dataGridUomProperties("volumePerVolumeUom")
                },
                {
                  name: "ratioConstGasMethodEnd",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumePerVolumeMeasure",
                  documentation:
                    "Constant gas ratio method final method ratio.",
                  properties: dataGridUomProperties("volumePerVolumeUom")
                },
                {
                  name: "densConstGasFoam",
                  required: false,
                  baseType: "double",
                  witsmlType: "densityMeasure",
                  documentation: "Constant gas ratio method average density.",
                  properties: dataGridUomProperties("densityUom")
                },
                {
                  name: "eTimThickening",
                  required: false,
                  baseType: "double",
                  witsmlType: "timeMeasure",
                  documentation: "Test thickening time.",
                  properties: dataGridUomProperties("timeUom")
                },
                {
                  name: "tempThickening",
                  required: false,
                  baseType: "double",
                  witsmlType: "thermodynamicTemperatureMeasure",
                  documentation: "Test thickening temperature.",
                  properties: dataGridUomProperties(
                    "thermodynamicTemperatureUom"
                  )
                },
                {
                  name: "presTestThickening",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Test thickening pressure.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "consTestThickening",
                  required: false,
                  baseType: "double",
                  witsmlType: "dimensionlessMeasure",
                  documentation:
                    "Test thickening consistency/slurry viscosity - Bearden Consistency (Bc) 0 to 100.",
                  properties: dataGridUomProperties("dimensionlessUom")
                },
                {
                  name: "pcFreeWater",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumePerVolumeMeasure",
                  documentation: "Test free water na: = mL/250ML.",
                  properties: dataGridUomProperties("volumePerVolumeUom")
                },
                {
                  name: "tempFreeWater",
                  required: false,
                  baseType: "double",
                  witsmlType: "thermodynamicTemperatureMeasure",
                  documentation: "Test free water temperature.",
                  properties: dataGridUomProperties(
                    "thermodynamicTemperatureUom"
                  )
                },
                {
                  name: "volTestFluidLoss",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Test fluid loss.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "tempFluidLoss",
                  required: false,
                  baseType: "double",
                  witsmlType: "thermodynamicTemperatureMeasure",
                  documentation: "Test fluid loss temperature.",
                  properties: dataGridUomProperties(
                    "thermodynamicTemperatureUom"
                  )
                },
                {
                  name: "presTestFluidLoss",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Test Fluid loss pressure.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "timeFluidLoss",
                  required: false,
                  baseType: "double",
                  witsmlType: "timeMeasure",
                  documentation:
                    "Test Fluid loss: dehydrating test period, used to compute the API Fluid Loss.",
                  properties: dataGridUomProperties("timeUom")
                },
                {
                  name: "volAPIFluidLoss",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation:
                    "API Fluid Loss = 2 * volTestFluidLoss * SQRT(30/timefluidloss).",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "eTimComprStren1",
                  required: false,
                  baseType: "double",
                  witsmlType: "timeMeasure",
                  documentation: "Compressive strength time 1.",
                  properties: dataGridUomProperties("timeUom")
                },
                {
                  name: "eTimComprStren2",
                  required: false,
                  baseType: "double",
                  witsmlType: "timeMeasure",
                  documentation: "Compressive strength time 2.",
                  properties: dataGridUomProperties("timeUom")
                },
                {
                  name: "presComprStren1",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Compressive strength pressure 1.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "presComprStren2",
                  required: false,
                  baseType: "double",
                  witsmlType: "pressureMeasure",
                  documentation: "Compressive strength pressure 2.",
                  properties: dataGridUomProperties("pressureUom")
                },
                {
                  name: "tempComprStren1",
                  required: false,
                  baseType: "double",
                  witsmlType: "thermodynamicTemperatureMeasure",
                  documentation: "Compressive strength temperature 1.",
                  properties: dataGridUomProperties(
                    "thermodynamicTemperatureUom"
                  )
                },
                {
                  name: "tempComprStren2",
                  required: false,
                  baseType: "double",
                  witsmlType: "thermodynamicTemperatureMeasure",
                  documentation: "Compressive strength temperature 2.",
                  properties: dataGridUomProperties(
                    "thermodynamicTemperatureUom"
                  )
                },
                {
                  name: "densAtPres",
                  required: false,
                  baseType: "double",
                  witsmlType: "densityMeasure",
                  documentation: "Slurry density at pressure.",
                  properties: dataGridUomProperties("densityUom")
                },
                {
                  name: "volReserved",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Volume reserved.",
                  properties: dataGridUomProperties("volumeUom")
                },
                {
                  name: "volTotSlurry",
                  required: false,
                  baseType: "double",
                  witsmlType: "volumeMeasure",
                  documentation: "Total Slurry Volume.",
                  properties: dataGridUomProperties("volumeUom")
                }
              ]
            },
            {
              name: "afterFlowAnn",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Annular flow at the end of displacement.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "squeezeObj",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Squeeze objective."
            },
            {
              name: "squeezeObtained",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Squeeze obtained.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "mdString",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation:
                "Measured depth of string (multi-stage cement job).",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdTool",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth of tool (multi-stage cement job.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdCoilTbg",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation:
                "Measured depth of CoilTubing (multi-stage cement job.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "volCsgIn",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Total volume inside casing.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "volCsgOut",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation:
                "Total volume outside casing for this stage placement.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "tailPipeUsed",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Tail pipe used?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "diaTailPipe",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation: "Tail pipe size (diameter).",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "tailPipePerf",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Tail pipe perforated?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "presTbgStart",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation:
                "Tubing pressure at start of job (not coiled tubing).",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presTbgEnd",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Tubing pressure at end of job.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presCsgStart",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Casing pressure at start of job.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presCsgEnd",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Casing pressure at end of job.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presBackPressure",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation:
                "Constant back pressure applied while pumping the job (can be supersede by a back pressure per pumping stage)  ",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presCoilTbgStart",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Pressure CTU start.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presCoilTbgEnd",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Pressure CTU end  ",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presBreakDown",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Breakdown pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "flowrateBreakDown",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Breakdown rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "presSqueezeAv",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Squeeze pressure average.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presSqueezeEnd",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Squeeze pressure final.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presSqueezeHeld",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Squeeze pressure held.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "presSqueeze",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Squeeze pressure left on pipe.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "eTimPresHeld",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Time pressure held.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "flowrateSqueezeAv",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Squeeze job average rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "flowrateSqueezeMx",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Squeeze job maximum rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "flowratePumpStart",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Pump rate at start of job.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "flowratePumpEnd",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Pump rate at end of job.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "pillBelowPlug",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Pill below plug.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "plugCatcher",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Plug catcher.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "mdCircOut",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Circulate out measured depth.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "volCircPrior",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Circulate prior to start of job.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "typeOriginalMud",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Type of mud in hole."
            },
            {
              name: "wtMud",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Mud density.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "visFunnelMud",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation:
                "Funnel viscosity in seconds (in hole at start of job).",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "pvMud",
              required: false,
              baseType: "double",
              witsmlType: "dynamicViscosityMeasure",
              documentation: "Plastic viscosity (in hole at start of job).",
              properties: dataGridUomProperties("dynamicViscosityUom")
            },
            {
              name: "ypMud",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Yield point (in hole at start of job).",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "gel10Sec",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Gels-10Sec (in hole at start of job).",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "gel10Min",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Gels-10Min (in hole at start of job).",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "tempBHCT",
              required: false,
              baseType: "double",
              witsmlType: "thermodynamicTemperatureMeasure",
              documentation: "Bottom hole circulating temperature.",
              properties: dataGridUomProperties("thermodynamicTemperatureUom")
            },
            {
              name: "tempBHST",
              required: false,
              baseType: "double",
              witsmlType: "thermodynamicTemperatureMeasure",
              documentation: "Bottom hole temperature static.",
              properties: dataGridUomProperties("thermodynamicTemperatureUom")
            },
            {
              name: "volExcessMethod",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Method to estimate excess volume."
            },
            {
              name: "mixMethod",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Mix method."
            },
            {
              name: "densMeasBy",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Method by which density is measured."
            },
            {
              name: "annFlowAfter",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Fluid returns.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "topPlug",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Top plug used?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "botPlug",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Bottom plug used.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "botPlugNumber",
              required: false,
              baseType: "int",
              witsmlType: "nonNegativeCount",
              documentation: "Amount of bottom plug used."
            },
            {
              name: "plugBumped",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Plug bumped? Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "presPriorBump",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation:
                "Pressure prior to bumping plug / pressure at end of displacement  ",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presBump",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Pressure plug bumped.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "presHeld",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Pressure held to.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "floatHeld",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Float held?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "volMudLost",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Total mud lost.",
              properties: dataGridUomProperties("volumeUom")
            },
            {
              name: "fluidDisplace",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Displacement fluid name."
            },
            {
              name: "densDisplaceFluid",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Density of displacement fluid.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "volDisplaceFluid",
              required: false,
              baseType: "double",
              witsmlType: "volumeMeasure",
              documentation: "Volume of displacement fluid.",
              properties: dataGridUomProperties("volumeUom")
            },
            dataGridExtensionNameValue
          ]
        },
        {
          name: "cementTest",
          baseType: "string",
          required: false,
          witsmlType: "cs_cementTest",
          documentation: "Test results post-job.",
          isContainer: true,
          properties: [
            {
              name: "presTest",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Test pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "eTimTest",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Elapsed tome to perform the test.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "cementShoeCollar",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Cement found between shoe and collar?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cetRun",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Cement evaluation tool run. Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cetBondQual",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Cement evaluation tool bond quality. Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cblRun",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Cement bond log run? Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cblBondQual",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Cement bond log quality indication. Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cblPres",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Cement bond Log under pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "tempSurvey",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Temperature survey run.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "eTimCementLog",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Hours before logging run after cement run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "formPit",
              required: false,
              baseType: "double",
              witsmlType: "forcePerVolumeMeasure",
              documentation:
                "PIT/LOT formation breakdown gradient or absolute pressure.",
              properties: dataGridUomProperties("forcePerVolumeUom")
            },
            {
              name: "toolCompanyPit",
              required: false,
              baseType: "string",
              witsmlType: "nameString",
              maxLength: 64,
              documentation: "Tool name for PIT."
            },
            {
              name: "eTimPitStart",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Hours between end of cement job-start of PIT.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "mdCementTop",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth at top of cement.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "topCementMethod",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Method to determine cement top."
            },
            {
              name: "tocOK",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Is the top of cement sufficient?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "jobRating",
              required: false,
              baseType: "string",
              witsmlType: "str16",
              maxLength: 16,
              documentation: "Job rating."
            },
            {
              name: "remedialCement",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Remedial cement required.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "numRemedial",
              required: false,
              baseType: "int",
              witsmlType: "nonNegativeCount",
              documentation: "Number of remedials."
            },
            {
              name: "failureMethod",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation:
                "Method used to determine if cement job unsuccessful."
            },
            {
              name: "linerTop",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation: "The distance to the top of the liner.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "linerLap",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation: "Liner overlap length.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "eTimBeforeTest",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Hours before liner top test.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "testNegativeTool",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Test negative tool for Liner top seal."
            },
            {
              name: "testNegativeEmw",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation: "Equivalent mud weight. Negative Test?  ",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "testPositiveTool",
              required: false,
              baseType: "string",
              witsmlType: "str32",
              maxLength: 32,
              documentation: "Test Positive Tool for liner top seal."
            },
            {
              name: "testPositiveEmw",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation:
                "Equivalent mud weight. Positive Test or absolute pressure .",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "cementFoundOnTool",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                'Cement found on tool?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "mdDVTool",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth to diverter tool.",
              properties: dataGridMeasuredDepthCoordProperties
            }
          ]
        },
        {
          name: "typePlug",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Plug type."
        },
        {
          name: "nameCementString",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name for the cementing string  "
        },
        {
          name: "dTimPlugSet",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time that cement plug was set."
        },
        {
          name: "cementDrillOut",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Cement drilled out flag. Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "dTimCementDrillOut",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time that cement was drilled out."
        },
        {
          name: "typeSqueeze",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Type of squeeze."
        },
        {
          name: "mdSqueeze",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation: "Measured depth of squeeze.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "dTimSqueeze",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time of squeeze."
        },
        {
          name: "toolCompany",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Tool Company."
        },
        {
          name: "typeTool",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Cement tool type."
        },
        {
          name: "dTimPipeRotStart",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Pipe rotation start time."
        },
        {
          name: "dTimPipeRotEnd",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Pipe rotation end time."
        },
        {
          name: "rpmPipe",
          required: false,
          baseType: "double",
          witsmlType: "anglePerTimeMeasure",
          documentation: "Pipe rotation rate (commonly in rpm).",
          properties: dataGridUomProperties("anglePerTimeUom")
        },
        {
          name: "tqInitPipeRot",
          required: false,
          baseType: "double",
          witsmlType: "momentOfForceMeasure",
          documentation: "Pipe rotation initial torque.",
          properties: dataGridUomProperties("momentOfForceUom")
        },
        {
          name: "tqPipeAv",
          required: false,
          baseType: "double",
          witsmlType: "momentOfForceMeasure",
          documentation: "Pipe rotation average torque.",
          properties: dataGridUomProperties("momentOfForceUom")
        },
        {
          name: "tqPipeMx",
          required: false,
          baseType: "double",
          witsmlType: "momentOfForceMeasure",
          documentation: "Pipe rotation maximum torque.",
          properties: dataGridUomProperties("momentOfForceUom")
        },
        {
          name: "dTimRecipStart",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time at start of pipe reciprocation."
        },
        {
          name: "dTimRecipEnd",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time at end of pipe reciprocation."
        },
        {
          name: "overPull",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "String up weight during reciprocation.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "slackOff",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "String down weight during reciprocation.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "rpmPipeRecip",
          required: false,
          baseType: "double",
          witsmlType: "anglePerTimeMeasure",
          documentation: "Pipe reciprocation RPM.",
          properties: dataGridUomProperties("anglePerTimeUom")
        },
        {
          name: "lenPipeRecipStroke",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Pipe reciprocation stroke length.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "coilTubing",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Coiled Tubing Used (true=CTU used). Values are "true" (or "1") and "false" (or "0").'
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
