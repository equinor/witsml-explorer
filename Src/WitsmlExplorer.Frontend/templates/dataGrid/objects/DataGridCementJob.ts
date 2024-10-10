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
          documentation: "Unique identifier for the cement job.",
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
            "Human recognizable context for the wellbore that contains the cement job."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the cement job."
        },
        {
          name: "jobType",
          documentation: "Type of cement job."
        },
        {
          name: "jobConfig",
          documentation: "Job configuration."
        },
        {
          name: "dTimJob",
          documentation: "Date and time of Cement Job."
        },
        {
          name: "nameCementedString",
          documentation: "Name for the cemented string  "
        },
        {
          name: "holeConfig",
          documentation: "Wellbore Geometry of annulus.",
          isContainer: true,
          properties: dataGridGrpWbGeometryProperties
        },
        {
          name: "nameWorkString",
          documentation: "Name for the cement work string  "
        },
        {
          name: "contractor",
          documentation: "Name of cementing contractor."
        },
        {
          name: "cementEngr",
          documentation: "Cementing engineer."
        },
        {
          name: "offshoreJob",
          documentation:
            'Offshore job? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "mdWater",
          documentation:
            "Water depth if offshore. The distance from mean sea level to water bottom.",
          properties: dataGridUomProperties
        },
        {
          name: "returnsToSeabed",
          documentation:
            'Returns to seabed? Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "reciprocating",
          documentation:
            'Pipe being reciprocated.  Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "woc",
          documentation: "Duration for waiting on cement to set.",
          properties: dataGridUomProperties
        },
        {
          name: "mdPlugTop",
          documentation: "If Plug, measured depth of top of plug.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdPlugBot",
          documentation: "If Plug, measured depth of bottom of plug.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdHole",
          documentation: "Measured depth at bottom of hole.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdShoe",
          documentation: "Measured depth of previous shoe.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "tvdShoe",
          documentation: "True Vertical Depth of previous shoe.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "mdStringSet",
          documentation: "Measured depth of cement string shoe.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "tvdStringSet",
          documentation: "True vertical depth of cement string shoe.",
          properties: dataGridWellVerticalDepthCoordProperties
        },
        {
          name: "cementStage",
          documentation: "Set of stages for the job (usually 1 or 2).",
          isContainer: true,
          isMultiple: true,
          properties: [
            {
              name: "uid",
              documentation: "Unique identifier for the stage.",
              isAttribute: true
            },
            {
              name: "numStage",
              documentation: "Stage number."
            },
            {
              name: "typeStage",
              documentation: "Stage type."
            },
            {
              name: "dTimMixStart",
              documentation: "Date and time when mixing started."
            },
            {
              name: "dTimPumpStart",
              documentation: "Datetime at start of pumping cement."
            },
            {
              name: "dTimPumpEnd",
              documentation: "Datetime at end of pumping cement."
            },
            {
              name: "dTimDisplaceStart",
              documentation: "Date and time when displacing cement started."
            },
            {
              name: "mdTop",
              documentation: "Measured depth at top of interval.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdBottom",
              documentation: "Measured depth of base of cement.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "volExcess",
              documentation: "Excess volume.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateDisplaceAv",
              documentation: "Average displacement rate.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateDisplaceMx",
              documentation: "Maximum displacement rate.",
              properties: dataGridUomProperties
            },
            {
              name: "presDisplace",
              documentation: "Final displacement pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "volReturns",
              documentation: "Volume of returns.",
              properties: dataGridUomProperties
            },
            {
              name: "eTimMudCirculation",
              documentation: "Mud circulation elapsed time before the job.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateMudCirc",
              documentation: "Rate mud circulated during stage.",
              properties: dataGridUomProperties
            },
            {
              name: "presMudCirc",
              documentation: "Mud circulation pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateEnd",
              documentation: "Final displacement pump rate.",
              properties: dataGridUomProperties
            },
            {
              name: "cementingFluid",
              documentation:
                "Displaced Mud, washes and spacers, cements, displacement mud.",
              isContainer: true,
              properties: [
                {
                  name: "typeFluid",
                  documentation: "Fluid type: Mud, Wash, Spacer, Slurry."
                },
                {
                  name: "fluidIndex",
                  documentation:
                    "Fluid Index: 1: first fluid pumped (=original mud), (last-1)=Tail cement, last= displacement mud"
                },
                {
                  name: "descFluid",
                  documentation: "Fluid description."
                },
                {
                  name: "purpose",
                  documentation: "Purpose description."
                },
                {
                  name: "classSlurryDryBlend",
                  documentation: "Slurry class."
                },
                {
                  name: "mdFluidTop",
                  documentation: "Measured depth at top of slurry placement.",
                  properties: dataGridMeasuredDepthCoordProperties
                },
                {
                  name: "mdFluidBottom",
                  documentation:
                    "Measured depth at bottom of slurry placement.",
                  properties: dataGridMeasuredDepthCoordProperties
                },
                {
                  name: "sourceWater",
                  documentation: "Water Source Description."
                },
                {
                  name: "volWater",
                  documentation: "Water volume.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volCement",
                  documentation: "Volume of cement.",
                  properties: dataGridUomProperties
                },
                {
                  name: "ratioMixWater",
                  documentation: "Mix Water Ratio.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volFluid",
                  documentation: "Fluid/Slurry Volume.",
                  properties: dataGridUomProperties
                },
                {
                  name: "cementPumpSchedule",
                  documentation: "Set of (Time / Rate / Back Pressure).",
                  isContainer: true,
                  properties: [
                    {
                      name: "eTimPump",
                      documentation:
                        "(Elapsed time period during the fluid is pumped.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "ratePump",
                      documentation:
                        "Rate fluid is pumped. 0 means it is a pause.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "volPump",
                      documentation: "Volume pumped = eTimPump * ratePump.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "strokePump",
                      documentation:
                        "Number of pump strokes for the fluid to be pumped (assumes pump output known)."
                    },
                    {
                      name: "presBack",
                      documentation:
                        "Back pressure applied during pumping stage.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "eTimShutdown",
                      documentation:
                        "If shutdown event, the elapsed time duration.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "comments",
                      documentation: "Comments and Remarks."
                    }
                  ]
                },
                {
                  name: "excessPc",
                  documentation: "Excess Percent.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volYield",
                  documentation: "Slurry Yield.",
                  properties: dataGridUomProperties
                },
                {
                  name: "density",
                  documentation: "Fluid density.",
                  properties: dataGridUomProperties
                },
                {
                  name: "solidVolumeFraction",
                  documentation: "Equals 1 - Porosity.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volPumped",
                  documentation: "Volume Pumped.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volOther",
                  documentation: "Other Volume.",
                  properties: dataGridUomProperties
                },
                {
                  name: "fluidRheologicalModel",
                  documentation: "Newtonian/Bingham/Power Law/Herschel Bulkley."
                },
                {
                  name: "vis",
                  documentation:
                    "Viscosity (Newtonian) or Plastic Viscosity if Bingham.",
                  properties: dataGridUomProperties
                },
                {
                  name: "yp",
                  documentation:
                    "Yield point (Bingham and Herschel Bulkley models).",
                  properties: dataGridUomProperties
                },
                {
                  name: "n",
                  documentation: "Power Law index (Power Law and HB).",
                  properties: dataGridUomProperties
                },
                {
                  name: "k",
                  documentation: "Consistency index (Power Law and HB).",
                  properties: dataGridUomProperties
                },
                {
                  name: "gel10SecReading",
                  documentation: "Gel reading after 10 seconds.",
                  properties: dataGridUomProperties
                },
                {
                  name: "gel10SecStrength",
                  documentation: "Gel strength after 10 seconds.",
                  properties: dataGridUomProperties
                },
                {
                  name: "gel1MinReading",
                  documentation: "Gel reading after 1 minute.",
                  properties: dataGridUomProperties
                },
                {
                  name: "gel1MinStrength",
                  documentation: "Gel strength after 1 minute.",
                  properties: dataGridUomProperties
                },
                {
                  name: "gel10MinReading",
                  documentation: "Gel reading after 10 minutes.",
                  properties: dataGridUomProperties
                },
                {
                  name: "gel10MinStrength",
                  documentation: "Gel strength after 10 minutes.",
                  properties: dataGridUomProperties
                },
                {
                  name: "typeBaseFluid",
                  documentation:
                    "Type of base fluid: Fresh water, Sea water, Brine, Brackish water."
                },
                {
                  name: "densBaseFluid",
                  documentation: "Density of base fluid.",
                  properties: dataGridUomProperties
                },
                {
                  name: "dryBlendName",
                  documentation: "Name of dry blend."
                },
                {
                  name: "dryBlendDescription",
                  documentation: "Description of dry blend."
                },
                {
                  name: "massDryBlend",
                  documentation:
                    "Mass of dry blend: the blend is made of different solid additives: the volume is not constant.",
                  properties: dataGridUomProperties
                },
                {
                  name: "densDryBlend",
                  documentation: "Density of Dry blend.",
                  properties: dataGridUomProperties
                },
                {
                  name: "massSackDryBlend",
                  documentation: "Weight of a sack of dry blend.",
                  properties: dataGridUomProperties
                },
                {
                  name: "cementAdditive",
                  documentation:
                    "Additives can be added in slurry but also in spacers, washes, mud.",
                  isContainer: true,
                  isMultiple: true,
                  properties: [
                    {
                      name: "uid",
                      documentation: "Unique identifier for the additive.",
                      isAttribute: true
                    },
                    {
                      name: "nameAdd",
                      documentation: "Additive name."
                    },
                    {
                      name: "typeAdd",
                      documentation:
                        "Additive type or Function (Retarder, Visosifier, Weighting agent)."
                    },
                    {
                      name: "formAdd",
                      documentation: "Wet or Dry."
                    },
                    {
                      name: "densAdd",
                      documentation: "Additive density.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "typeConc",
                      documentation:
                        "ConcentrationType: %BWOC (%By weight of Cement), %BWOB (%By weight of blend), %BWOW (%By weight of water), %BWOBF (%By weight of base fluid)"
                    },
                    {
                      name: "concentration",
                      documentation:
                        "Concentration Amount: unit type depends of typeConc.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "wtSack",
                      documentation:
                        "Concentration in terms of weight per sack.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "volSack",
                      documentation:
                        "Concentration in terms of volume per sack.",
                      properties: dataGridUomProperties
                    },
                    {
                      name: "additive",
                      documentation: "Additive Amount.",
                      properties: dataGridUomProperties
                    },
                    dataGridExtensionNameValue
                  ]
                },
                {
                  name: "foamUsed",
                  documentation:
                    'Foam used indicator.  Values are "true" (or "1") and "false" (or "0").'
                },
                {
                  name: "typeGasFoam",
                  documentation: "Gas type used for foam job."
                },
                {
                  name: "volGasFoam",
                  documentation: "Volume of gas used for foam job.",
                  properties: dataGridUomProperties
                },
                {
                  name: "ratioConstGasMethodAv",
                  documentation: "Constant gas ratio method ratio  ",
                  properties: dataGridUomProperties
                },
                {
                  name: "densConstGasMethod",
                  documentation: "Constant gas ratio method average density.",
                  properties: dataGridUomProperties
                },
                {
                  name: "ratioConstGasMethodStart",
                  documentation:
                    "Constant gas ratio method initial method ratio.",
                  properties: dataGridUomProperties
                },
                {
                  name: "ratioConstGasMethodEnd",
                  documentation:
                    "Constant gas ratio method final method ratio.",
                  properties: dataGridUomProperties
                },
                {
                  name: "densConstGasFoam",
                  documentation: "Constant gas ratio method average density.",
                  properties: dataGridUomProperties
                },
                {
                  name: "eTimThickening",
                  documentation: "Test thickening time.",
                  properties: dataGridUomProperties
                },
                {
                  name: "tempThickening",
                  documentation: "Test thickening temperature.",
                  properties: dataGridUomProperties
                },
                {
                  name: "presTestThickening",
                  documentation: "Test thickening pressure.",
                  properties: dataGridUomProperties
                },
                {
                  name: "consTestThickening",
                  documentation:
                    "Test thickening consistency/slurry viscosity - Bearden Consistency (Bc) 0 to 100.",
                  properties: dataGridUomProperties
                },
                {
                  name: "pcFreeWater",
                  documentation: "Test free water na: = mL/250ML.",
                  properties: dataGridUomProperties
                },
                {
                  name: "tempFreeWater",
                  documentation: "Test free water temperature.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volTestFluidLoss",
                  documentation: "Test fluid loss.",
                  properties: dataGridUomProperties
                },
                {
                  name: "tempFluidLoss",
                  documentation: "Test fluid loss temperature.",
                  properties: dataGridUomProperties
                },
                {
                  name: "presTestFluidLoss",
                  documentation: "Test Fluid loss pressure.",
                  properties: dataGridUomProperties
                },
                {
                  name: "timeFluidLoss",
                  documentation:
                    "Test Fluid loss: dehydrating test period, used to compute the API Fluid Loss.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volAPIFluidLoss",
                  documentation:
                    "API Fluid Loss = 2 * volTestFluidLoss * SQRT(30/timefluidloss).",
                  properties: dataGridUomProperties
                },
                {
                  name: "eTimComprStren1",
                  documentation: "Compressive strength time 1.",
                  properties: dataGridUomProperties
                },
                {
                  name: "eTimComprStren2",
                  documentation: "Compressive strength time 2.",
                  properties: dataGridUomProperties
                },
                {
                  name: "presComprStren1",
                  documentation: "Compressive strength pressure 1.",
                  properties: dataGridUomProperties
                },
                {
                  name: "presComprStren2",
                  documentation: "Compressive strength pressure 2.",
                  properties: dataGridUomProperties
                },
                {
                  name: "tempComprStren1",
                  documentation: "Compressive strength temperature 1.",
                  properties: dataGridUomProperties
                },
                {
                  name: "tempComprStren2",
                  documentation: "Compressive strength temperature 2.",
                  properties: dataGridUomProperties
                },
                {
                  name: "densAtPres",
                  documentation: "Slurry density at pressure.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volReserved",
                  documentation: "Volume reserved.",
                  properties: dataGridUomProperties
                },
                {
                  name: "volTotSlurry",
                  documentation: "Total Slurry Volume.",
                  properties: dataGridUomProperties
                }
              ]
            },
            {
              name: "afterFlowAnn",
              documentation:
                'Annular flow at the end of displacement.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "squeezeObj",
              documentation: "Squeeze objective."
            },
            {
              name: "squeezeObtained",
              documentation:
                'Squeeze obtained.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "mdString",
              documentation:
                "Measured depth of string (multi-stage cement job).",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdTool",
              documentation: "Measured depth of tool (multi-stage cement job.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdCoilTbg",
              documentation:
                "Measured depth of CoilTubing (multi-stage cement job.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "volCsgIn",
              documentation: "Total volume inside casing.",
              properties: dataGridUomProperties
            },
            {
              name: "volCsgOut",
              documentation:
                "Total volume outside casing for this stage placement.",
              properties: dataGridUomProperties
            },
            {
              name: "tailPipeUsed",
              documentation:
                'Tail pipe used?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "diaTailPipe",
              documentation: "Tail pipe size (diameter).",
              properties: dataGridUomProperties
            },
            {
              name: "tailPipePerf",
              documentation:
                'Tail pipe perforated?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "presTbgStart",
              documentation:
                "Tubing pressure at start of job (not coiled tubing).",
              properties: dataGridUomProperties
            },
            {
              name: "presTbgEnd",
              documentation: "Tubing pressure at end of job.",
              properties: dataGridUomProperties
            },
            {
              name: "presCsgStart",
              documentation: "Casing pressure at start of job.",
              properties: dataGridUomProperties
            },
            {
              name: "presCsgEnd",
              documentation: "Casing pressure at end of job.",
              properties: dataGridUomProperties
            },
            {
              name: "presBackPressure",
              documentation:
                "Constant back pressure applied while pumping the job (can be supersede by a back pressure per pumping stage)  ",
              properties: dataGridUomProperties
            },
            {
              name: "presCoilTbgStart",
              documentation: "Pressure CTU start.",
              properties: dataGridUomProperties
            },
            {
              name: "presCoilTbgEnd",
              documentation: "Pressure CTU end  ",
              properties: dataGridUomProperties
            },
            {
              name: "presBreakDown",
              documentation: "Breakdown pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateBreakDown",
              documentation: "Breakdown rate.",
              properties: dataGridUomProperties
            },
            {
              name: "presSqueezeAv",
              documentation: "Squeeze pressure average.",
              properties: dataGridUomProperties
            },
            {
              name: "presSqueezeEnd",
              documentation: "Squeeze pressure final.",
              properties: dataGridUomProperties
            },
            {
              name: "presSqueezeHeld",
              documentation:
                'Squeeze pressure held.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "presSqueeze",
              documentation: "Squeeze pressure left on pipe.",
              properties: dataGridUomProperties
            },
            {
              name: "eTimPresHeld",
              documentation: "Time pressure held.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateSqueezeAv",
              documentation: "Squeeze job average rate.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateSqueezeMx",
              documentation: "Squeeze job maximum rate.",
              properties: dataGridUomProperties
            },
            {
              name: "flowratePumpStart",
              documentation: "Pump rate at start of job.",
              properties: dataGridUomProperties
            },
            {
              name: "flowratePumpEnd",
              documentation: "Pump rate at end of job.",
              properties: dataGridUomProperties
            },
            {
              name: "pillBelowPlug",
              documentation:
                'Pill below plug.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "plugCatcher",
              documentation:
                'Plug catcher.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "mdCircOut",
              documentation: "Circulate out measured depth.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "volCircPrior",
              documentation: "Circulate prior to start of job.",
              properties: dataGridUomProperties
            },
            {
              name: "typeOriginalMud",
              documentation: "Type of mud in hole."
            },
            {
              name: "wtMud",
              documentation: "Mud density.",
              properties: dataGridUomProperties
            },
            {
              name: "visFunnelMud",
              documentation:
                "Funnel viscosity in seconds (in hole at start of job).",
              properties: dataGridUomProperties
            },
            {
              name: "pvMud",
              documentation: "Plastic viscosity (in hole at start of job).",
              properties: dataGridUomProperties
            },
            {
              name: "ypMud",
              documentation: "Yield point (in hole at start of job).",
              properties: dataGridUomProperties
            },
            {
              name: "gel10Sec",
              documentation: "Gels-10Sec (in hole at start of job).",
              properties: dataGridUomProperties
            },
            {
              name: "gel10Min",
              documentation: "Gels-10Min (in hole at start of job).",
              properties: dataGridUomProperties
            },
            {
              name: "tempBHCT",
              documentation: "Bottom hole circulating temperature.",
              properties: dataGridUomProperties
            },
            {
              name: "tempBHST",
              documentation: "Bottom hole temperature static.",
              properties: dataGridUomProperties
            },
            {
              name: "volExcessMethod",
              documentation: "Method to estimate excess volume."
            },
            {
              name: "mixMethod",
              documentation: "Mix method."
            },
            {
              name: "densMeasBy",
              documentation: "Method by which density is measured."
            },
            {
              name: "annFlowAfter",
              documentation:
                'Fluid returns.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "topPlug",
              documentation:
                'Top plug used?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "botPlug",
              documentation:
                'Bottom plug used.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "botPlugNumber",
              documentation: "Amount of bottom plug used."
            },
            {
              name: "plugBumped",
              documentation:
                'Plug bumped? Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "presPriorBump",
              documentation:
                "Pressure prior to bumping plug / pressure at end of displacement  ",
              properties: dataGridUomProperties
            },
            {
              name: "presBump",
              documentation: "Pressure plug bumped.",
              properties: dataGridUomProperties
            },
            {
              name: "presHeld",
              documentation: "Pressure held to.",
              properties: dataGridUomProperties
            },
            {
              name: "floatHeld",
              documentation:
                'Float held?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "volMudLost",
              documentation: "Total mud lost.",
              properties: dataGridUomProperties
            },
            {
              name: "fluidDisplace",
              documentation: "Displacement fluid name."
            },
            {
              name: "densDisplaceFluid",
              documentation: "Density of displacement fluid.",
              properties: dataGridUomProperties
            },
            {
              name: "volDisplaceFluid",
              documentation: "Volume of displacement fluid.",
              properties: dataGridUomProperties
            },
            dataGridExtensionNameValue
          ]
        },
        {
          name: "cementTest",
          documentation: "Test results post-job.",
          properties: [
            {
              name: "presTest",
              documentation: "Test pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "eTimTest",
              documentation: "Elapsed tome to perform the test.",
              properties: dataGridUomProperties
            },
            {
              name: "cementShoeCollar",
              documentation:
                'Cement found between shoe and collar?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cetRun",
              documentation:
                'Cement evaluation tool run. Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cetBondQual",
              documentation:
                'Cement evaluation tool bond quality. Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cblRun",
              documentation:
                'Cement bond log run? Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cblBondQual",
              documentation:
                'Cement bond log quality indication. Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "cblPres",
              documentation: "Cement bond Log under pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "tempSurvey",
              documentation:
                'Temperature survey run.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "eTimCementLog",
              documentation: "Hours before logging run after cement run.",
              properties: dataGridUomProperties
            },
            {
              name: "formPit",
              documentation:
                "PIT/LOT formation breakdown gradient or absolute pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "toolCompanyPit",
              documentation: "Tool name for PIT."
            },
            {
              name: "eTimPitStart",
              documentation: "Hours between end of cement job-start of PIT.",
              properties: dataGridUomProperties
            },
            {
              name: "mdCementTop",
              documentation: "Measured depth at top of cement.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "topCementMethod",
              documentation: "Method to determine cement top."
            },
            {
              name: "tocOK",
              documentation:
                'Is the top of cement sufficient?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "jobRating",
              documentation: "Job rating."
            },
            {
              name: "remedialCement",
              documentation:
                'Remedial cement required.  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "numRemedial",
              documentation: "Number of remedials."
            },
            {
              name: "failureMethod",
              documentation:
                "Method used to determine if cement job unsuccessful."
            },
            {
              name: "linerTop",
              documentation: "The distance to the top of the liner.",
              properties: dataGridUomProperties
            },
            {
              name: "linerLap",
              documentation: "Liner overlap length.",
              properties: dataGridUomProperties
            },
            {
              name: "eTimBeforeTest",
              documentation: "Hours before liner top test.",
              properties: dataGridUomProperties
            },
            {
              name: "testNegativeTool",
              documentation: "Test negative tool for Liner top seal."
            },
            {
              name: "testNegativeEmw",
              documentation: "Equivalent mud weight. Negative Test?  ",
              properties: dataGridUomProperties
            },
            {
              name: "testPositiveTool",
              documentation: "Test Positive Tool for liner top seal."
            },
            {
              name: "testPositiveEmw",
              documentation:
                "Equivalent mud weight. Positive Test or absolute pressure .",
              properties: dataGridUomProperties
            },
            {
              name: "cementFoundOnTool",
              documentation:
                'Cement found on tool?  Values are "true" (or "1") and "false" (or "0").'
            },
            {
              name: "mdDVTool",
              documentation: "Measured depth to diverter tool.",
              properties: dataGridMeasuredDepthCoordProperties
            }
          ]
        },
        {
          name: "typePlug",
          documentation: "Plug type."
        },
        {
          name: "nameCementString",
          documentation: "Name for the cementing string  "
        },
        {
          name: "dTimPlugSet",
          documentation: "Date and time that cement plug was set."
        },
        {
          name: "cementDrillOut",
          documentation:
            'Cement drilled out flag. Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "dTimCementDrillOut",
          documentation: "Date and time that cement was drilled out."
        },
        {
          name: "typeSqueeze",
          documentation: "Type of squeeze."
        },
        {
          name: "mdSqueeze",
          documentation: "Measured depth of squeeze.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "dTimSqueeze",
          documentation: "Date and time of squeeze."
        },
        {
          name: "toolCompany",
          documentation: "Tool Company."
        },
        {
          name: "typeTool",
          documentation: "Cement tool type."
        },
        {
          name: "dTimPipeRotStart",
          documentation: "Pipe rotation start time."
        },
        {
          name: "dTimPipeRotEnd",
          documentation: "Pipe rotation end time."
        },
        {
          name: "rpmPipe",
          documentation: "Pipe rotation rate (commonly in rpm).",
          properties: dataGridUomProperties
        },
        {
          name: "tqInitPipeRot",
          documentation: "Pipe rotation initial torque.",
          properties: dataGridUomProperties
        },
        {
          name: "tqPipeAv",
          documentation: "Pipe rotation average torque.",
          properties: dataGridUomProperties
        },
        {
          name: "tqPipeMx",
          documentation: "Pipe rotation maximum torque.",
          properties: dataGridUomProperties
        },
        {
          name: "dTimRecipStart",
          documentation: "Date and time at start of pipe reciprocation."
        },
        {
          name: "dTimRecipEnd",
          documentation: "Date and time at end of pipe reciprocation."
        },
        {
          name: "overPull",
          documentation: "String up weight during reciprocation.",
          properties: dataGridUomProperties
        },
        {
          name: "slackOff",
          documentation: "String down weight during reciprocation.",
          properties: dataGridUomProperties
        },
        {
          name: "rpmPipeRecip",
          documentation: "Pipe reciprocation RPM.",
          properties: dataGridUomProperties
        },
        {
          name: "lenPipeRecipStroke",
          documentation: "Pipe reciprocation stroke length.",
          properties: dataGridUomProperties
        },
        {
          name: "coilTubing",
          documentation:
            'Coiled Tubing Used (true=CTU used). Values are "true" (or "1") and "false" (or "0").'
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
