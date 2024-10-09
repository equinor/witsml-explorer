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
          documentation: "Unique identifier for the run.",
          isAttribute: true
        },
        {
          name: "nameWell",
          documentation: ""
        },
        {
          name: "nameWellbore",
          documentation:
            "Human recognizable context for the wellbore that contains the bottom hole assembly."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the run."
        },
        {
          name: "tubular",
          documentation:
            "This represents a foreign key to the tubular (assembly) that was utilized in this run.",
          properties: dataGridRefNameStringProperties
        },
        {
          name: "dTimStart",
          documentation: "Date and time that activities started."
        },
        {
          name: "dTimStop",
          documentation: "Date and time that activities stopped."
        },
        {
          name: "dTimStartDrilling",
          documentation: "Start on bottom - date and time."
        },
        {
          name: "dTimStopDrilling",
          documentation: "Start off bottom - date and time."
        },
        {
          name: "planDogleg",
          documentation: "Planned dogleg severity.",
          properties: dataGridUomProperties
        },
        {
          name: "actDogleg",
          documentation: "Actual dogleg severity.",
          properties: dataGridUomProperties
        },
        {
          name: "actDoglegMx",
          documentation: "Actual dogleg severity - Maximum.",
          properties: dataGridUomProperties
        },
        {
          name: "statusBha",
          documentation: "Bottom hole assembly status."
        },
        {
          name: "numBitRun",
          documentation: "Bit run number."
        },
        {
          name: "numStringRun",
          documentation: "The BHA (drilling string) run number."
        },
        {
          name: "reasonTrip",
          documentation: "Reason for trip."
        },
        {
          name: "objectiveBha",
          documentation: "Objective of bottom hole assembly."
        },
        {
          name: "drillingParams",
          documentation: "Drilling parameters.",
          isContainer: true,
          properties: [
            {
              name: "uid",
              documentation: "Unique identifier for the parameters.",
              isAttribute: true
            },
            {
              name: "eTimOpBit",
              documentation: "Operating time spent by bit for run.",
              properties: dataGridUomProperties
            },
            {
              name: "mdHoleStart",
              documentation: "Measured depth at start.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdHoleStop",
              documentation: "Measured depth at stop.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "tubular",
              documentation: "A pointer to the tubular assembly.",
              properties: dataGridRefNameStringProperties
            },
            {
              name: "hkldRot",
              documentation: "Hookload - rotating.",
              properties: dataGridUomProperties
            },
            {
              name: "overPull",
              documentation: "hkldUp-hkldRot.",
              properties: dataGridUomProperties
            },
            {
              name: "slackOff",
              documentation: "hkldRot-hkldDown.",
              properties: dataGridUomProperties
            },
            {
              name: "hkldUp",
              documentation: "Hookload - string moving up.",
              properties: dataGridUomProperties
            },
            {
              name: "hkldDn",
              documentation: "Hookload - string moving down.",
              properties: dataGridUomProperties
            },
            {
              name: "tqOnBotAv",
              documentation: "Average Torque - on bottom.",
              properties: dataGridUomProperties
            },
            {
              name: "tqOnBotMx",
              documentation: "Maximum torque - on bottom.",
              properties: dataGridUomProperties
            },
            {
              name: "tqOnBotMn",
              documentation: "Minimum torque - on bottom.",
              properties: dataGridUomProperties
            },
            {
              name: "tqOffBotAv",
              documentation: "Average torque - off bottom.",
              properties: dataGridUomProperties
            },
            {
              name: "tqDhAv",
              documentation: "Average torque - downhole.",
              properties: dataGridUomProperties
            },
            {
              name: "wtAboveJar",
              documentation: "Weight above jars.",
              properties: dataGridUomProperties
            },
            {
              name: "wtBelowJar",
              documentation: "Weight below jars.",
              properties: dataGridUomProperties
            },
            {
              name: "wtMud",
              documentation: "Mud density.",
              properties: dataGridUomProperties
            },
            {
              name: "flowratePump",
              documentation: "Pump flow rate.",
              properties: dataGridUomProperties
            },
            {
              name: "powBit",
              documentation: "Bit hydraulic.",
              properties: dataGridUomProperties
            },
            {
              name: "velNozzleAv",
              documentation: "Bit nozzle average velocity.",
              properties: dataGridUomProperties
            },
            {
              name: "presDropBit",
              documentation: "Pressure drop in bit.",
              properties: dataGridUomProperties
            },
            {
              name: "cTimHold",
              documentation: "Time spent on hold from start of bit run.",
              properties: dataGridUomProperties
            },
            {
              name: "cTimSteering",
              documentation: "Time spent steering from start of bit run.",
              properties: dataGridUomProperties
            },
            {
              name: "cTimDrillRot",
              documentation:
                "Time spent rotary drilling from start of bit run.",
              properties: dataGridUomProperties
            },
            {
              name: "cTimDrillSlid",
              documentation: "Time spent slide drilling from start of bit run.",
              properties: dataGridUomProperties
            },
            {
              name: "cTimCirc",
              documentation: "Time spent circulating from start of bit run.",
              properties: dataGridUomProperties
            },
            {
              name: "cTimReam",
              documentation: "Time spent reaming from start of bit run.",
              properties: dataGridUomProperties
            },
            {
              name: "distDrillRot",
              documentation: "Distance drilled - rotating.",
              properties: dataGridUomProperties
            },
            {
              name: "distDrillSlid",
              documentation: "Distance drilled - sliding.",
              properties: dataGridUomProperties
            },
            {
              name: "distReam",
              documentation: "Distance reamed.",
              properties: dataGridUomProperties
            },
            {
              name: "distHold",
              documentation:
                "Distance covered while holding angle with a steerable drilling assembly.",
              properties: dataGridUomProperties
            },
            {
              name: "distSteering",
              documentation:
                "Distance covered while actively steering with a steerable drilling assembly.",
              properties: dataGridUomProperties
            },
            {
              name: "rpmAv",
              documentation:
                "Average turn rate (commonly in rpm) through Interval.",
              properties: dataGridUomProperties
            },
            {
              name: "rpmMx",
              documentation: "Maximum turn rate (commonly in rpm).",
              properties: dataGridUomProperties
            },
            {
              name: "rpmMn",
              documentation: "Minimum turn rate (commonly in rpm).",
              properties: dataGridUomProperties
            },
            {
              name: "rpmAvDh",
              documentation: "Average turn rate (commonly in rpm) downhole.",
              properties: dataGridUomProperties
            },
            {
              name: "ropAv",
              documentation: "Average rate of penetration through Interval.",
              properties: dataGridUomProperties
            },
            {
              name: "ropMx",
              documentation: "Maximum rate of penetration through Interval.",
              properties: dataGridUomProperties
            },
            {
              name: "ropMn",
              documentation: "Minimum rate of penetration through Interval.",
              properties: dataGridUomProperties
            },
            {
              name: "wobAv",
              documentation:
                "Surface weight on bit - average through interval.",
              properties: dataGridUomProperties
            },
            {
              name: "wobMx",
              documentation: "Weight on bit - maximum.",
              properties: dataGridUomProperties
            },
            {
              name: "wobMn",
              documentation: "Weight on bit - minimum.",
              properties: dataGridUomProperties
            },
            {
              name: "wobAvDh",
              documentation: "Weight on bit - average downhole.",
              properties: dataGridUomProperties
            },
            {
              name: "reasonTrip",
              documentation: "Reason for trip."
            },
            {
              name: "objectiveBha",
              documentation: "Objective of bottom hole assembly."
            },
            {
              name: "aziTop",
              documentation: "Azimuth at start measured depth.",
              properties: dataGridUomProperties
            },
            {
              name: "aziBottom",
              documentation: "Azimuth at stop measured depth.",
              properties: dataGridUomProperties
            },
            {
              name: "inclStart",
              documentation: "Inclination at start measured depth.",
              properties: dataGridUomProperties
            },
            {
              name: "inclMx",
              documentation: "Maximum inclination.",
              properties: dataGridUomProperties
            },
            {
              name: "inclMn",
              documentation: "Minimum inclination.",
              properties: dataGridUomProperties
            },
            {
              name: "inclStop",
              documentation: "Inclination at stop measured depth.",
              properties: dataGridUomProperties
            },
            {
              name: "tempMudDhMx",
              documentation: "Maximum mud temperature downhole during run.",
              properties: dataGridUomProperties
            },
            {
              name: "presPumpAv",
              documentation: "Average pump pressure.",
              properties: dataGridUomProperties
            },
            {
              name: "flowrateBit",
              documentation: "Flow rate at bit.",
              properties: dataGridUomProperties
            },
            {
              name: "mudClass",
              documentation: "The class of the drilling fluid."
            },
            {
              name: "mudSubClass",
              documentation: "Mud Subtype at event occurrence."
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
