import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridBopProperties: DataGridProperty[] = [
  {
    name: "manufacturer",
    documentation: "Manufacturer / supplier of the item."
  },
  {
    name: "model",
    documentation: "Manufacturers designated model."
  },
  {
    name: "dTimInstall",
    documentation: "Date and time of installation."
  },
  {
    name: "dTimRemove",
    documentation: "Removal Date."
  },
  {
    name: "nameTag",
    documentation:
      "An identification tag for the blow out preventer. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  {
    name: "typeConnectionBop",
    documentation: "Type of connection to Blow Out Preventer."
  },
  {
    name: "sizeConnectionBop",
    documentation: "Size of connection to Blow Out Preventer.",
    properties: dataGridUomProperties
  },
  {
    name: "presBopRating",
    documentation: "Maximum Pressure rating of Blow Out Preventer.",
    properties: dataGridUomProperties
  },
  {
    name: "sizeBopSys",
    documentation: "Maximum tubulars passable through Blow Out Preventer.",
    properties: dataGridUomProperties
  },
  {
    name: "rotBop",
    documentation:
      'Is this a Rotating Blow Out Preventer? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "idBoosterLine",
    documentation: "Inner diameter of Booster Line.",
    properties: dataGridUomProperties
  },
  {
    name: "odBoosterLine",
    documentation: "Outer diameter of Booster Line.",
    properties: dataGridUomProperties
  },
  {
    name: "lenBoosterLine",
    documentation: "Length of Booster Line along riser.",
    properties: dataGridUomProperties
  },
  {
    name: "idSurfLine",
    documentation: "Inner diameter of Surface Line.",
    properties: dataGridUomProperties
  },
  {
    name: "odSurfLine",
    documentation: "Outer diameter of Surface Line.",
    properties: dataGridUomProperties
  },
  {
    name: "lenSurfLine",
    documentation: "Length of Choke Line along riser.",
    properties: dataGridUomProperties
  },
  {
    name: "idChkLine",
    documentation: "Inner diameter of Choke Line.",
    properties: dataGridUomProperties
  },
  {
    name: "odChkLine",
    documentation: "Outer diameter of Choke Line.",
    properties: dataGridUomProperties
  },
  {
    name: "lenChkLine",
    documentation: "Length of Choke Line along riser.",
    properties: dataGridUomProperties
  },
  {
    name: "idKillLine",
    documentation: "Inner diameter of Kill Line.",
    properties: dataGridUomProperties
  },
  {
    name: "odKillLine",
    documentation: "Outer diameter of Kill Line.",
    properties: dataGridUomProperties
  },
  {
    name: "lenKillLine",
    documentation: "Length of Kill Line.",
    properties: dataGridUomProperties
  },
  {
    name: "bopComponent",
    documentation:
      "Container element for Blow Out Preventer component schema elements.",
    isContainer: true,
    isMultiple: true,
    properties: [
      {
        name: "uid",
        documentation:
          "Unique identifier for the Blow Out Preventer Component.",
        isAttribute: true
      },
      {
        name: "typeBopComp",
        documentation: "Type of ram/preventer."
      },
      {
        name: "descComp",
        documentation: "Description of component."
      },
      {
        name: "idPassThru",
        documentation: "Inner diameter that tubulars can pass thru.",
        properties: dataGridUomProperties
      },
      {
        name: "presWork",
        documentation: "Working rating pressure of the component.",
        properties: dataGridUomProperties
      },
      {
        name: "diaCloseMn",
        documentation: "Minimum diameter of component it will seal.",
        properties: dataGridUomProperties
      },
      {
        name: "diaCloseMx",
        documentation: "Maximum diameter of component it will seal.",
        properties: dataGridUomProperties
      },
      {
        name: "nomenclature",
        documentation:
          "Arrangement nomenclature for the Blow Out Preventer stack (e.g. S, R, A)."
      },
      {
        name: "isVariable",
        documentation:
          'Is Ram bore variable or single size? Defaults to false. Values are "true" (or "1") and "false" (or "0").'
      },
      dataGridExtensionNameValue
    ]
  },
  {
    name: "typeDiverter",
    documentation: "Diverter description."
  },
  {
    name: "diaDiverter",
    documentation: "Diameter of diverter.",
    properties: dataGridUomProperties
  },
  {
    name: "presWorkDiverter",
    documentation: "Working rating pressure of the component.",
    properties: dataGridUomProperties
  },
  {
    name: "accumulator",
    documentation: "Type of accumulator/description."
  },
  {
    name: "capAccFluid",
    documentation: "Accumulator fluid capacity.",
    properties: dataGridUomProperties
  },
  {
    name: "presAccPreCharge",
    documentation: "Accumulator pre-charge pressure.",
    properties: dataGridUomProperties
  },
  {
    name: "volAccPreCharge",
    documentation: "Accumulator pre-charge volume",
    properties: dataGridUomProperties
  },
  {
    name: "presAccOpRating",
    documentation: "Accumulator operating pressure rating.",
    properties: dataGridUomProperties
  },
  {
    name: "typeControlManifold",
    documentation: "Blow Out Preventer Control System."
  },
  {
    name: "descControlManifold",
    documentation: "Description of control system."
  },
  {
    name: "typeChokeManifold",
    documentation: "Type of choke manifold."
  },
  {
    name: "presChokeManifold",
    documentation: "Choke manifold pressure.",
    properties: dataGridUomProperties
  }
];
