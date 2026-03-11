import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridBopProperties } from "templates/dataGrid/objects/common/properties/DataGridBopProperties";
import { dataGridCentrifugeProperties } from "templates/dataGrid/objects/common/properties/DataGridCentrifugeProperties";
import { dataGridDegasserProperties } from "templates/dataGrid/objects/common/properties/DataGridDegasserProperties";
import { dataGridHydrocycloneProperties } from "templates/dataGrid/objects/common/properties/DataGridHydrocycloneProperties";
import { dataGridPitProperties } from "templates/dataGrid/objects/common/properties/DataGridPitProperties";
import { dataGridPumpProperties } from "templates/dataGrid/objects/common/properties/DataGridPumpProperties";
import { dataGridShakerProperties } from "templates/dataGrid/objects/common/properties/DataGridShakerProperties";
import { dataGridSurfaceEquipment } from "templates/dataGrid/objects/common/properties/DataGridSurfaceEquipmentProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridRig: DataGridProperty = {
  name: "rigs",
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
      name: "rig",
      documentation: "A single rig.",
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
          documentation: "Unique identifier for the rig.",
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
            "Human recognizable context for the wellbore that contains the rig."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the rig."
        },
        {
          name: "owner",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Contractor/owner."
        },
        {
          name: "typeRig",
          required: false,
          baseType: "string",
          witsmlType: "rigType",
          maxLength: 50,
          documentation: "Rig type."
        },
        {
          name: "manufacturer",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Manufacturer / supplier of the item."
        },
        {
          name: "yearEntService",
          required: false,
          baseType: "int",
          witsmlType: "calendarYear",
          maxLength: 4,
          documentation: "Year entered service (CCYY)."
        },
        {
          name: "classRig",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Rig classification."
        },
        {
          name: "approvals",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Rig approvals/certification."
        },
        {
          name: "registration",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Rig registration location."
        },
        {
          name: "telNumber",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Rig telephone number."
        },
        {
          name: "faxNumber",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Rig fax number."
        },
        {
          name: "emailAddress",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Rig Email address."
        },
        {
          name: "nameContact",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of contact person."
        },
        {
          name: "ratingDrillDepth",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Maximum hole depth rating for the rig.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "ratingWaterDepth",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Working water depth capability of rig.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "isOffshore",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Flag to indicate that rig is an offshore rig (Drill Ship, Semi, Jack-up, Platform, TADU). Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "airGap",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation:
            "Air gap from Rig Floor to ground or mean sea level depending on location.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "dTimStartOp",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "Date and time rig operations started, or date and time object created."
        },
        {
          name: "dTimEndOp",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "Date and time rig operations ended (May be NULL for active rig)."
        },
        {
          name: "bop",
          required: false,
          witsmlType: "cs_bop",
          documentation: "Blow out preventer description and components.",
          isContainer: true,
          properties: dataGridBopProperties
        },
        {
          name: "pit",
          required: false,
          witsmlType: "cs_pit",
          documentation: "Pit equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridPitProperties
        },
        {
          name: "pump",
          required: false,
          witsmlType: "cs_pump",
          documentation:
            "Drilling fluid (mud/cement) pumping units for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridPumpProperties
        },
        {
          name: "shaker",
          required: false,
          witsmlType: "cs_shaker",
          documentation: "Mud cleaning shaker equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridShakerProperties
        },
        {
          name: "centrifuge",
          required: false,
          witsmlType: "cs_centrifuge",
          documentation: "Mud cleaning centrifuge equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridCentrifugeProperties
        },
        {
          name: "hydrocyclone",
          required: false,
          witsmlType: "cs_hydrocyclone",
          documentation: "Mud cleaning hydrocyclone equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridHydrocycloneProperties
        },
        {
          name: "degasser",
          required: false,
          witsmlType: "cs_degasser",
          documentation: "Mud de-gasser equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridDegasserProperties
        },
        {
          name: "surfaceEquipment",
          required: false,
          witsmlType: "cs_surfaceEquipment",
          documentation: "Coiled tubing specific equipment configuration.",
          isContainer: true,
          properties: dataGridSurfaceEquipment
        },
        {
          name: "numDerricks",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of derricks on the rig."
        },
        {
          name: "typeDerrick",
          required: false,
          baseType: "string",
          witsmlType: "derrickType",
          maxLength: 50,
          documentation: "Derrick type."
        },
        {
          name: "ratingDerrick",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Maximum support load applied to derrick structure.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "htDerrick",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Height of derrick.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "ratingHkld",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Maximum hookload rating.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "capWindDerrick",
          required: false,
          baseType: "double",
          witsmlType: "velocityMeasure",
          documentation: "Derrick wind capacity.",
          properties: dataGridUomProperties("velocityUom")
        },
        {
          name: "wtBlock",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Block weight.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "ratingBlock",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Weight rating of the travelling block.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "numBlockLines",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of block lines."
        },
        {
          name: "typeHook",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Type of hook."
        },
        {
          name: "ratingHook",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Weight rating of the hook.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "sizeDrillLine",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Drill line diameter.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "typeDrawWorks",
          required: false,
          baseType: "string",
          witsmlType: "drawWorksType",
          maxLength: 50,
          documentation: "Draw-works type."
        },
        {
          name: "powerDrawWorks",
          required: false,
          baseType: "double",
          witsmlType: "powerMeasure",
          documentation: "Draw works horse power.",
          properties: dataGridUomProperties("powerUom")
        },
        {
          name: "ratingDrawWorks",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Weight rating of the drawworks.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "motorDrawWorks",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Description of the drawworks motor."
        },
        {
          name: "descBrake",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Rig brake description."
        },
        {
          name: "typeSwivel",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Type of Swivel."
        },
        {
          name: "ratingSwivel",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Maximum swivel rating.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "rotSystem",
          required: false,
          baseType: "string",
          witsmlType: "driveType",
          maxLength: 50,
          documentation: "Work string drive type."
        },
        {
          name: "descRotSystem",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Description of rotating system."
        },
        {
          name: "ratingTqRotSys",
          required: false,
          baseType: "double",
          witsmlType: "momentOfForceMeasure",
          documentation: "Work string rotational torque rating.",
          properties: dataGridUomProperties("momentOfForceUom")
        },
        {
          name: "rotSizeOpening",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Rotary size opening.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "ratingRotSystem",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Work string rotational torque rating.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "scrSystem",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Description of slow circulation rates system."
        },
        {
          name: "pipeHandlingSystem",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Name of pipe handling system."
        },
        {
          name: "capBulkMud",
          required: false,
          baseType: "double",
          witsmlType: "volumeMeasure",
          documentation: "Bulk/dry mud storage capacity.",
          properties: dataGridUomProperties("volumeUom")
        },
        {
          name: "capLiquidMud",
          required: false,
          baseType: "double",
          witsmlType: "volumeMeasure",
          documentation: "Liquid mud storage capacity.",
          properties: dataGridUomProperties("volumeUom")
        },
        {
          name: "capDrillWater",
          required: false,
          baseType: "double",
          witsmlType: "volumeMeasure",
          documentation: "Drill water capacity.",
          properties: dataGridUomProperties("volumeUom")
        },
        {
          name: "capPotableWater",
          required: false,
          baseType: "double",
          witsmlType: "volumeMeasure",
          documentation: "Potable water capacity.",
          properties: dataGridUomProperties("volumeUom")
        },
        {
          name: "capFuel",
          required: false,
          baseType: "double",
          witsmlType: "volumeMeasure",
          documentation: "Fuel capacity.",
          properties: dataGridUomProperties("volumeUom")
        },
        {
          name: "capBulkCement",
          required: false,
          baseType: "double",
          witsmlType: "volumeMeasure",
          documentation: "Capacity of bulk cement.",
          properties: dataGridUomProperties("volumeUom")
        },
        {
          name: "mainEngine",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Power system."
        },
        {
          name: "generator",
          required: false,
          baseType: "string",
          witsmlType: "shortDescriptionString",
          maxLength: 64,
          documentation:
            "Description of the electrical power generating system."
        },
        {
          name: "cementUnit",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Name of cement unit on the rig."
        },
        {
          name: "numBunks",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of beds available on the rig."
        },
        {
          name: "bunksPerRoom",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of bunks per room."
        },
        {
          name: "numCranes",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of cranes on the rig."
        },
        {
          name: "numAnch",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of anchors."
        },
        {
          name: "moorType",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Mooring type."
        },
        {
          name: "numGuideTens",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of guideline tensioners."
        },
        {
          name: "numRiserTens",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of riser tensioners."
        },
        {
          name: "varDeckLdMx",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Variable deck load maximum (offshore rigs only).",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "vdlStorm",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation:
            "Variable deck load storm rating (offshore rigs only).",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "numThrusters",
          required: false,
          baseType: "int",
          witsmlType: "nonNegativeCount",
          documentation: "Number of thrusters."
        },
        {
          name: "azimuthing",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            'Are the thrusters azimuth. Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "motionCompensationMn",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Minimum motion compensation.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "motionCompensationMx",
          required: false,
          baseType: "double",
          witsmlType: "forceMeasure",
          documentation: "Maximum motion compensation.",
          properties: dataGridUomProperties("forceUom")
        },
        {
          name: "strokeMotionCompensation",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Length of motion compensation provided by equipment.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "riserAngleLimit",
          required: false,
          baseType: "double",
          witsmlType: "planeAngleMeasure",
          documentation: "Riser angle limit.",
          properties: dataGridUomProperties("planeAngleUom")
        },
        {
          name: "heaveMx",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Maximum allowable heave.",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "gantry",
          required: false,
          baseType: "string",
          witsmlType: "shortDescriptionString",
          maxLength: 64,
          documentation: "Description of gantry."
        },
        {
          name: "flares",
          required: false,
          baseType: "string",
          witsmlType: "shortDescriptionString",
          maxLength: 64,
          documentation: "Description of flare."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
