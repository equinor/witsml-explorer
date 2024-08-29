import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

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
          properties: [
            {
              name: "uidRef",
              documentation:
                "A reference to the unique identifier (uid attribute) in the node referenced by the name value. This attribute is required within the context of a WITSML server.",
              isAttribute: true
            }
          ]
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
          properties: [
            {
              name: "uom",
              documentation: "",
              isAttribute: true
            }
          ]
        },
        {
          name: "actDogleg",
          documentation: "Actual dogleg severity.",
          properties: [
            {
              name: "uom",
              documentation: "",
              isAttribute: true
            }
          ]
        },
        {
          name: "actDoglegMx",
          documentation: "Actual dogleg severity - Maximum.",
          properties: [
            {
              name: "uom",
              documentation: "",
              isAttribute: true
            }
          ]
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
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "mdHoleStart",
              documentation: "Measured depth at start.",
              properties: [
                {
                  name: "uom",
                  documentation: "The unit of measure of the quantity value.",
                  isAttribute: true
                },
                {
                  name: "datum",
                  documentation:
                    "A pointer to the reference datum for this coordinate value as defined in WellDatum. This value is assumed to match the uid value in a WellDatum. If not given then the default WellDatum must be assumed.",
                  isAttribute: true
                }
              ]
            },
            {
              name: "mdHoleStop",
              documentation: "Measured depth at stop.",
              properties: [
                {
                  name: "uom",
                  documentation: "The unit of measure of the quantity value.",
                  isAttribute: true
                },
                {
                  name: "datum",
                  documentation:
                    "A pointer to the reference datum for this coordinate value as defined in WellDatum. This value is assumed to match the uid value in a WellDatum. If not given then the default WellDatum must be assumed.",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tubular",
              documentation: "A pointer to the tubular assembly.",
              properties: [
                {
                  name: "uidRef",
                  documentation:
                    "A reference to the unique identifier (uid attribute) in the node referenced by the name value. This attribute is required within the context of a WITSML server.",
                  isAttribute: true
                }
              ]
            },
            {
              name: "hkldRot",
              documentation: "Hookload - rotating.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "overPull",
              documentation: "hkldUp-hkldRot.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "slackOff",
              documentation: "hkldRot-hkldDown.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "hkldUp",
              documentation: "Hookload - string moving up.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "hkldDn",
              documentation: "Hookload - string moving down.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tqOnBotAv",
              documentation: "Average Torque - on bottom.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tqOnBotMx",
              documentation: "Maximum torque - on bottom.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tqOnBotMn",
              documentation: "Minimum torque - on bottom.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tqOffBotAv",
              documentation: "Average torque - off bottom.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tqDhAv",
              documentation: "Average torque - downhole.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wtAboveJar",
              documentation: "Weight above jars.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wtBelowJar",
              documentation: "Weight below jars.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wtMud",
              documentation: "Mud density.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "flowratePump",
              documentation: "Pump flow rate.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "powBit",
              documentation: "Bit hydraulic.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "velNozzleAv",
              documentation: "Bit nozzle average velocity.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "presDropBit",
              documentation: "Pressure drop in bit.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "cTimHold",
              documentation: "Time spent on hold from start of bit run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "cTimSteering",
              documentation: "Time spent steering from start of bit run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "cTimDrillRot",
              documentation:
                "Time spent rotary drilling from start of bit run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "cTimDrillSlid",
              documentation: "Time spent slide drilling from start of bit run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "cTimCirc",
              documentation: "Time spent circulating from start of bit run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "cTimReam",
              documentation: "Time spent reaming from start of bit run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "distDrillRot",
              documentation: "Distance drilled - rotating.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "distDrillSlid",
              documentation: "Distance drilled - sliding.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "distReam",
              documentation: "Distance reamed.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "distHold",
              documentation:
                "Distance covered while holding angle with a steerable drilling assembly.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "distSteering",
              documentation:
                "Distance covered while actively steering with a steerable drilling assembly.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "rpmAv",
              documentation:
                "Average turn rate (commonly in rpm) through Interval.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "rpmMx",
              documentation: "Maximum turn rate (commonly in rpm).",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "rpmMn",
              documentation: "Minimum turn rate (commonly in rpm).",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "rpmAvDh",
              documentation: "Average turn rate (commonly in rpm) downhole.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "ropAv",
              documentation: "Average rate of penetration through Interval.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "ropMx",
              documentation: "Maximum rate of penetration through Interval.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "ropMn",
              documentation: "Minimum rate of penetration through Interval.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wobAv",
              documentation:
                "Surface weight on bit - average through interval.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wobMx",
              documentation: "Weight on bit - maximum.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wobMn",
              documentation: "Weight on bit - minimum.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "wobAvDh",
              documentation: "Weight on bit - average downhole.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
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
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "aziBottom",
              documentation: "Azimuth at stop measured depth.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "inclStart",
              documentation: "Inclination at start measured depth.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "inclMx",
              documentation: "Maximum inclination.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "inclMn",
              documentation: "Minimum inclination.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "inclStop",
              documentation: "Inclination at stop measured depth.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "tempMudDhMx",
              documentation: "Maximum mud temperature downhole during run.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "presPumpAv",
              documentation: "Average pump pressure.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
            },
            {
              name: "flowrateBit",
              documentation: "Flow rate at bit.",
              properties: [
                {
                  name: "uom",
                  documentation: "",
                  isAttribute: true
                }
              ]
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
