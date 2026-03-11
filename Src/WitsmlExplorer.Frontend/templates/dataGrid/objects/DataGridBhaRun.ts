import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridBhaRun: DataGridProperty = {
  name: "bhaRuns",
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
      name: "bhaRun",
      documentation:
        "A single bottom hole assembly run. This represents the period beginning when the BHA enters the hole until it leaves the hole.",
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
          documentation: "Unique identifier for the run.",
          isAttribute: true
        },
        {
          name: "nameWell",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: ""
        },
        {
          name: "nameWellbore",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable context for the wellbore that contains the bottom hole assembly."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the run."
        },
        {
          name: "tubular",
          required: true,
          baseType: "string",
          witsmlType: "refNameString",
          maxLength: 64,
          documentation:
            "This represents a foreign key to the tubular (assembly) that was utilized in this run.",
          properties: dataGridRefNameStringProperties
        },
        {
          name: "dTimStart",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time that activities started."
        },
        {
          name: "dTimStop",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time that activities stopped."
        },
        {
          name: "dTimStartDrilling",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Start on bottom - date and time."
        },
        {
          name: "dTimStopDrilling",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Start off bottom - date and time."
        },
        {
          name: "planDogleg",
          required: false,
          baseType: "double",
          witsmlType: "anglePerLengthMeasure",
          documentation: "Planned dogleg severity.",
          properties: dataGridUomProperties("anglePerLengthUom")
        },
        {
          name: "actDogleg",
          required: false,
          baseType: "double",
          witsmlType: "anglePerLengthMeasure",
          documentation: "Actual dogleg severity.",
          properties: dataGridUomProperties("anglePerLengthUom")
        },
        {
          name: "actDoglegMx",
          required: false,
          baseType: "double",
          witsmlType: "anglePerLengthMeasure",
          documentation: "Actual dogleg severity - Maximum.",
          properties: dataGridUomProperties("anglePerLengthUom")
        },
        {
          name: "statusBha",
          required: false,
          baseType: "string",
          witsmlType: "bhaStatus",
          maxLength: 50,
          documentation: "Bottom hole assembly status."
        },
        {
          name: "numBitRun",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Bit run number."
        },
        {
          name: "numStringRun",
          required: false,
          baseType: "int",
          witsmlType: "positiveCount",
          documentation: "The BHA (drilling string) run number."
        },
        {
          name: "reasonTrip",
          required: false,
          baseType: "string",
          witsmlType: "commentString",
          maxLength: 4000,
          documentation: "Reason for trip."
        },
        {
          name: "objectiveBha",
          required: false,
          baseType: "string",
          witsmlType: "commentString",
          maxLength: 4000,
          documentation: "Objective of bottom hole assembly."
        },
        {
          name: "drillingParams",
          required: false,
          witsmlType: "cs_drillingParams",
          documentation: "Drilling parameters.",
          isMultiple: true,
          isContainer: true,
          properties: [
            {
              name: "uid",
              required: false,
              baseType: "string",
              witsmlType: "uidString",
              maxLength: 64,
              documentation: "Unique identifier for the parameters.",
              isAttribute: true
            },
            {
              name: "eTimOpBit",
              required: true,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Operating time spent by bit for run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "mdHoleStart",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth at start.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdHoleStop",
              required: true,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation: "Measured depth at stop.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "tubular",
              required: false,
              baseType: "string",
              witsmlType: "refNameString",
              maxLength: 64,
              documentation: "A pointer to the tubular assembly.",
              properties: dataGridRefNameStringProperties
            },
            {
              name: "hkldRot",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Hookload - rotating.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "overPull",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "hkldUp-hkldRot.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "slackOff",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "hkldRot-hkldDown.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "hkldUp",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Hookload - string moving up.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "hkldDn",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Hookload - string moving down.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "tqOnBotAv",
              required: false,
              baseType: "double",
              witsmlType: "momentOfForceMeasure",
              documentation: "Average Torque - on bottom.",
              properties: dataGridUomProperties("momentOfForceUom")
            },
            {
              name: "tqOnBotMx",
              required: false,
              baseType: "double",
              witsmlType: "momentOfForceMeasure",
              documentation: "Maximum torque - on bottom.",
              properties: dataGridUomProperties("momentOfForceUom")
            },
            {
              name: "tqOnBotMn",
              required: false,
              baseType: "double",
              witsmlType: "momentOfForceMeasure",
              documentation: "Minimum torque - on bottom.",
              properties: dataGridUomProperties("momentOfForceUom")
            },
            {
              name: "tqOffBotAv",
              required: false,
              baseType: "double",
              witsmlType: "momentOfForceMeasure",
              documentation: "Average torque - off bottom.",
              properties: dataGridUomProperties("momentOfForceUom")
            },
            {
              name: "tqDhAv",
              required: false,
              baseType: "double",
              witsmlType: "momentOfForceMeasure",
              documentation: "Average torque - downhole.",
              properties: dataGridUomProperties("momentOfForceUom")
            },
            {
              name: "wtAboveJar",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Weight above jars.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "wtBelowJar",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Weight below jars.",
              properties: dataGridUomProperties("forceUom")
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
              name: "flowratePump",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Pump flow rate.",
              properties: dataGridUomProperties("volumeFlowRateUom")
            },
            {
              name: "powBit",
              required: false,
              baseType: "double",
              witsmlType: "powerMeasure",
              documentation: "Bit hydraulic.",
              properties: dataGridUomProperties("powerUom")
            },
            {
              name: "velNozzleAv",
              required: false,
              baseType: "double",
              witsmlType: "velocityMeasure",
              documentation: "Bit nozzle average velocity.",
              properties: dataGridUomProperties("velocityUom")
            },
            {
              name: "presDropBit",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Pressure drop in bit.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "cTimHold",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Time spent on hold from start of bit run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "cTimSteering",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Time spent steering from start of bit run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "cTimDrillRot",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation:
                "Time spent rotary drilling from start of bit run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "cTimDrillSlid",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Time spent slide drilling from start of bit run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "cTimCirc",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Time spent circulating from start of bit run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "cTimReam",
              required: false,
              baseType: "double",
              witsmlType: "timeMeasure",
              documentation: "Time spent reaming from start of bit run.",
              properties: dataGridUomProperties("timeUom")
            },
            {
              name: "distDrillRot",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation: "Distance drilled - rotating.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "distDrillSlid",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation: "Distance drilled - sliding.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "distReam",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation: "Distance reamed.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "distHold",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation:
                "Distance covered while holding angle with a steerable drilling assembly.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "distSteering",
              required: false,
              baseType: "double",
              witsmlType: "lengthMeasure",
              documentation:
                "Distance covered while actively steering with a steerable drilling assembly.",
              properties: dataGridUomProperties("lengthUom")
            },
            {
              name: "rpmAv",
              required: false,
              baseType: "double",
              witsmlType: "anglePerTimeMeasure",
              documentation:
                "Average turn rate (commonly in rpm) through Interval.",
              properties: dataGridUomProperties("anglePerTimeUom")
            },
            {
              name: "rpmMx",
              required: false,
              baseType: "double",
              witsmlType: "anglePerTimeMeasure",
              documentation: "Maximum turn rate (commonly in rpm).",
              properties: dataGridUomProperties("anglePerTimeUom")
            },
            {
              name: "rpmMn",
              required: false,
              baseType: "double",
              witsmlType: "anglePerTimeMeasure",
              documentation: "Minimum turn rate (commonly in rpm).",
              properties: dataGridUomProperties("anglePerTimeUom")
            },
            {
              name: "rpmAvDh",
              required: false,
              baseType: "double",
              witsmlType: "anglePerTimeMeasure",
              documentation: "Average turn rate (commonly in rpm) downhole.",
              properties: dataGridUomProperties("anglePerTimeUom")
            },
            {
              name: "ropAv",
              required: false,
              baseType: "double",
              witsmlType: "velocityMeasure",
              documentation: "Average rate of penetration through Interval.",
              properties: dataGridUomProperties("velocityUom")
            },
            {
              name: "ropMx",
              required: false,
              baseType: "double",
              witsmlType: "velocityMeasure",
              documentation: "Maximum rate of penetration through Interval.",
              properties: dataGridUomProperties("velocityUom")
            },
            {
              name: "ropMn",
              required: false,
              baseType: "double",
              witsmlType: "velocityMeasure",
              documentation: "Minimum rate of penetration through Interval.",
              properties: dataGridUomProperties("velocityUom")
            },
            {
              name: "wobAv",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation:
                "Surface weight on bit - average through interval.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "wobMx",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Weight on bit - maximum.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "wobMn",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Weight on bit - minimum.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "wobAvDh",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation: "Weight on bit - average downhole.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "reasonTrip",
              required: false,
              baseType: "string",
              witsmlType: "commentString",
              maxLength: 4000,
              documentation: "Reason for trip."
            },
            {
              name: "objectiveBha",
              required: false,
              baseType: "string",
              witsmlType: "commentString",
              maxLength: 4000,
              documentation: "Objective of bottom hole assembly."
            },
            {
              name: "aziTop",
              required: false,
              baseType: "double",
              witsmlType: "planeAngleMeasure",
              documentation: "Azimuth at start measured depth.",
              properties: dataGridUomProperties("planeAngleUom")
            },
            {
              name: "aziBottom",
              required: false,
              baseType: "double",
              witsmlType: "planeAngleMeasure",
              documentation: "Azimuth at stop measured depth.",
              properties: dataGridUomProperties("planeAngleUom")
            },
            {
              name: "inclStart",
              required: false,
              baseType: "double",
              witsmlType: "planeAngleMeasure",
              documentation: "Inclination at start measured depth.",
              properties: dataGridUomProperties("planeAngleUom")
            },
            {
              name: "inclMx",
              required: false,
              baseType: "double",
              witsmlType: "planeAngleMeasure",
              documentation: "Maximum inclination.",
              properties: dataGridUomProperties("planeAngleUom")
            },
            {
              name: "inclMn",
              required: false,
              baseType: "double",
              witsmlType: "planeAngleMeasure",
              documentation: "Minimum inclination.",
              properties: dataGridUomProperties("planeAngleUom")
            },
            {
              name: "inclStop",
              required: false,
              baseType: "double",
              witsmlType: "planeAngleMeasure",
              documentation: "Inclination at stop measured depth.",
              properties: dataGridUomProperties("planeAngleUom")
            },
            {
              name: "tempMudDhMx",
              required: false,
              baseType: "double",
              witsmlType: "thermodynamicTemperatureMeasure",
              documentation: "Maximum mud temperature downhole during run.",
              properties: dataGridUomProperties("thermodynamicTemperatureUom")
            },
            {
              name: "presPumpAv",
              required: false,
              baseType: "double",
              witsmlType: "pressureMeasure",
              documentation: "Average pump pressure.",
              properties: dataGridUomProperties("pressureUom")
            },
            {
              name: "flowrateBit",
              required: false,
              baseType: "double",
              witsmlType: "volumeFlowRateMeasure",
              documentation: "Flow rate at bit.",
              properties: dataGridUomProperties("volumeFlowRateUom")
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
              name: "mudSubClass",
              required: false,
              baseType: "string",
              witsmlType: "mudSubClass",
              maxLength: 50,
              documentation: "Mud Subtype at event occurrence."
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
