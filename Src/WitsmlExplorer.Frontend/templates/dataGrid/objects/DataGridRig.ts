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
          documentation: "Unique identifier for the rig.",
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
            "Human recognizable context for the wellbore that contains the rig."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the rig."
        },
        {
          name: "owner",
          documentation: "Contractor/owner."
        },
        {
          name: "typeRig",
          documentation: "Rig type."
        },
        {
          name: "manufacturer",
          documentation: "Manufacturer / supplier of the item."
        },
        {
          name: "yearEntService",
          documentation: "Year entered service (CCYY)."
        },
        {
          name: "classRig",
          documentation: "Rig classification."
        },
        {
          name: "approvals",
          documentation: "Rig approvals/certification."
        },
        {
          name: "registration",
          documentation: "Rig registration location."
        },
        {
          name: "telNumber",
          documentation: "Rig telephone number."
        },
        {
          name: "faxNumber",
          documentation: "Rig fax number."
        },
        {
          name: "emailAddress",
          documentation: "Rig Email address."
        },
        {
          name: "nameContact",
          documentation: "Name of contact person."
        },
        {
          name: "ratingDrillDepth",
          documentation: "Maximum hole depth rating for the rig.",
          properties: dataGridUomProperties
        },
        {
          name: "ratingWaterDepth",
          documentation: "Working water depth capability of rig.",
          properties: dataGridUomProperties
        },
        {
          name: "isOffshore",
          documentation:
            'Flag to indicate that rig is an offshore rig (Drill Ship, Semi, Jack-up, Platform, TADU). Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "airGap",
          documentation:
            "Air gap from Rig Floor to ground or mean sea level depending on location.",
          properties: dataGridUomProperties
        },
        {
          name: "dTimStartOp",
          documentation:
            "Date and time rig operations started, or date and time object created."
        },
        {
          name: "dTimEndOp",
          documentation:
            "Date and time rig operations ended (May be NULL for active rig)."
        },
        {
          name: "bop",
          documentation: "Blow out preventer description and components.",
          isContainer: true,
          properties: dataGridBopProperties
        },
        {
          name: "pit",
          documentation: "Pit equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridPitProperties
        },
        {
          name: "pump",
          documentation:
            "Drilling fluid (mud/cement) pumping units for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridPumpProperties
        },
        {
          name: "shaker",
          documentation: "Mud cleaning shaker equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridShakerProperties
        },
        {
          name: "centrifuge",
          documentation: "Mud cleaning centrifuge equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridCentrifugeProperties
        },
        {
          name: "hydrocyclone",
          documentation: "Mud cleaning hydrocyclone equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridHydrocycloneProperties
        },
        {
          name: "degasser",
          documentation: "Mud de-gasser equipment for the rig.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridDegasserProperties
        },
        {
          name: "surfaceEquipment",
          documentation: "Coiled tubing specific equipment configuration.",
          isContainer: true,
          properties: dataGridSurfaceEquipment
        },
        {
          name: "numDerricks",
          documentation: "Number of derricks on the rig."
        },
        {
          name: "typeDerrick",
          documentation: "Derrick type."
        },
        {
          name: "ratingDerrick",
          documentation: "Maximum support load applied to derrick structure.",
          properties: dataGridUomProperties
        },
        {
          name: "htDerrick",
          documentation: "Height of derrick.",
          properties: dataGridUomProperties
        },
        {
          name: "ratingHkld",
          documentation: "Maximum hookload rating.",
          properties: dataGridUomProperties
        },
        {
          name: "capWindDerrick",
          documentation: "Derrick wind capacity.",
          properties: dataGridUomProperties
        },
        {
          name: "wtBlock",
          documentation: "Block weight.",
          properties: dataGridUomProperties
        },
        {
          name: "ratingBlock",
          documentation: "Weight rating of the travelling block.",
          properties: dataGridUomProperties
        },
        {
          name: "numBlockLines",
          documentation: "Number of block lines."
        },
        {
          name: "typeHook",
          documentation: "Type of hook."
        },
        {
          name: "ratingHook",
          documentation: "Weight rating of the hook.",
          properties: dataGridUomProperties
        },
        {
          name: "sizeDrillLine",
          documentation: "Drill line diameter.",
          properties: dataGridUomProperties
        },
        {
          name: "typeDrawWorks",
          documentation: "Draw-works type."
        },
        {
          name: "powerDrawWorks",
          documentation: "Draw works horse power.",
          properties: dataGridUomProperties
        },
        {
          name: "ratingDrawWorks",
          documentation: "Weight rating of the drawworks.",
          properties: dataGridUomProperties
        },
        {
          name: "motorDrawWorks",
          documentation: "Description of the drawworks motor."
        },
        {
          name: "descBrake",
          documentation: "Rig brake description."
        },
        {
          name: "typeSwivel",
          documentation: "Type of Swivel."
        },
        {
          name: "ratingSwivel",
          documentation: "Maximum swivel rating.",
          properties: dataGridUomProperties
        },
        {
          name: "rotSystem",
          documentation: "Work string drive type."
        },
        {
          name: "descRotSystem",
          documentation: "Description of rotating system."
        },
        {
          name: "ratingTqRotSys",
          documentation: "Work string rotational torque rating.",
          properties: dataGridUomProperties
        },
        {
          name: "rotSizeOpening",
          documentation: "Rotary size opening.",
          properties: dataGridUomProperties
        },
        {
          name: "ratingRotSystem",
          documentation: "Work string rotational torque rating.",
          properties: dataGridUomProperties
        },
        {
          name: "scrSystem",
          documentation: "Description of slow circulation rates system."
        },
        {
          name: "pipeHandlingSystem",
          documentation: "Name of pipe handling system."
        },
        {
          name: "capBulkMud",
          documentation: "Bulk/dry mud storage capacity.",
          properties: dataGridUomProperties
        },
        {
          name: "capLiquidMud",
          documentation: "Liquid mud storage capacity.",
          properties: dataGridUomProperties
        },
        {
          name: "capDrillWater",
          documentation: "Drill water capacity.",
          properties: dataGridUomProperties
        },
        {
          name: "capPotableWater",
          documentation: "Potable water capacity.",
          properties: dataGridUomProperties
        },
        {
          name: "capFuel",
          documentation: "Fuel capacity.",
          properties: dataGridUomProperties
        },
        {
          name: "capBulkCement",
          documentation: "Capacity of bulk cement.",
          properties: dataGridUomProperties
        },
        {
          name: "mainEngine",
          documentation: "Power system."
        },
        {
          name: "generator",
          documentation:
            "Description of the electrical power generating system."
        },
        {
          name: "cementUnit",
          documentation: "Name of cement unit on the rig."
        },
        {
          name: "numBunks",
          documentation: "Number of beds available on the rig."
        },
        {
          name: "bunksPerRoom",
          documentation: "Number of bunks per room."
        },
        {
          name: "numCranes",
          documentation: "Number of cranes on the rig."
        },
        {
          name: "numAnch",
          documentation: "Number of anchors."
        },
        {
          name: "moorType",
          documentation: "Mooring type."
        },
        {
          name: "numGuideTens",
          documentation: "Number of guideline tensioners."
        },
        {
          name: "numRiserTens",
          documentation: "Number of riser tensioners."
        },
        {
          name: "varDeckLdMx",
          documentation: "Variable deck load maximum (offshore rigs only).",
          properties: dataGridUomProperties
        },
        {
          name: "vdlStorm",
          documentation:
            "Variable deck load storm rating (offshore rigs only).",
          properties: dataGridUomProperties
        },
        {
          name: "numThrusters",
          documentation: "Number of thrusters."
        },
        {
          name: "azimuthing",
          documentation:
            'Are the thrusters azimuth. Values are "true" (or "1") and "false" (or "0").'
        },
        {
          name: "motionCompensationMn",
          documentation: "Minimum motion compensation.",
          properties: dataGridUomProperties
        },
        {
          name: "motionCompensationMx",
          documentation: "Maximum motion compensation.",
          properties: dataGridUomProperties
        },
        {
          name: "strokeMotionCompensation",
          documentation: "Length of motion compensation provided by equipment.",
          properties: dataGridUomProperties
        },
        {
          name: "riserAngleLimit",
          documentation: "Riser angle limit.",
          properties: dataGridUomProperties
        },
        {
          name: "heaveMx",
          documentation: "Maximum allowable heave.",
          properties: dataGridUomProperties
        },
        {
          name: "gantry",
          documentation: "Description of gantry."
        },
        {
          name: "flares",
          documentation: "Description of flare."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
