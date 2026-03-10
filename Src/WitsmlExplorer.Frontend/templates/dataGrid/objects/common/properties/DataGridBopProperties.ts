import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridBopProperties: DataGridProperty[] = [
  {
    name: "manufacturer",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Manufacturer / supplier of the item."
  },
  {
    name: "model",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Manufacturers designated model."
  },
  {
    name: "dTimInstall",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Date and time of installation."
  },
  {
    name: "dTimRemove",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Removal Date."
  },
  {
    name: "nameTag",
    required: false,
    witsmlType: "cs_nameTag",
    documentation:
      "An identification tag for the blow out preventer. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  {
    name: "typeConnectionBop",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Type of connection to Blow Out Preventer."
  },
  {
    name: "sizeConnectionBop",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Size of connection to Blow Out Preventer.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "presBopRating",
    required: true,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Maximum Pressure rating of Blow Out Preventer.",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "sizeBopSys",
    required: true,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Maximum tubulars passable through Blow Out Preventer.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "rotBop",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Is this a Rotating Blow Out Preventer? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "idBoosterLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of Booster Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "odBoosterLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Outer diameter of Booster Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenBoosterLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of Booster Line along riser.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idSurfLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of Surface Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "odSurfLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Outer diameter of Surface Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenSurfLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of Choke Line along riser.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idChkLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of Choke Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "odChkLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Outer diameter of Choke Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenChkLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of Choke Line along riser.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idKillLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of Kill Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "odKillLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Outer diameter of Kill Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenKillLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of Kill Line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "bopComponent",
    required: false,
    witsmlType: "cs_bopComponent",
    documentation:
      "Container element for Blow Out Preventer component schema elements.",
    isContainer: true,
    isMultiple: true,
    properties: [
      {
        name: "uid",
        required: false,
        baseType: "string",
        witsmlType: "uidString",
        maxLength: 64,
        documentation:
          "Unique identifier for the Blow Out Preventer Component.",
        isAttribute: true
      },
      {
        name: "typeBopComp",
        required: false,
        baseType: "string",
        witsmlType: "bopType",
        maxLength: 50,
        documentation: "Type of ram/preventer."
      },
      {
        name: "descComp",
        required: false,
        baseType: "string",
        witsmlType: "shortDescriptionString",
        maxLength: 64,
        documentation: "Description of component."
      },
      {
        name: "idPassThru",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Inner diameter that tubulars can pass thru.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "presWork",
        required: false,
        baseType: "double",
        witsmlType: "pressureMeasure",
        documentation: "Working rating pressure of the component.",
        properties: dataGridUomProperties("pressureUom")
      },
      {
        name: "diaCloseMn",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Minimum diameter of component it will seal.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "diaCloseMx",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Maximum diameter of component it will seal.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "nomenclature",
        required: false,
        baseType: "string",
        witsmlType: "str2",
        maxLength: 2,
        documentation:
          "Arrangement nomenclature for the Blow Out Preventer stack (e.g. S, R, A)."
      },
      {
        name: "isVariable",
        required: false,
        baseType: "boolean",
        witsmlType: "logicalBoolean",
        documentation:
          'Is Ram bore variable or single size? Defaults to false. Values are "true" (or "1") and "false" (or "0").'
      },
      dataGridExtensionNameValue
    ]
  },
  {
    name: "typeDiverter",
    required: false,
    baseType: "string",
    witsmlType: "shortDescriptionString",
    maxLength: 64,
    documentation: "Diverter description."
  },
  {
    name: "diaDiverter",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Diameter of diverter.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "presWorkDiverter",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Working rating pressure of the component.",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "accumulator",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Type of accumulator/description."
  },
  {
    name: "capAccFluid",
    required: false,
    baseType: "double",
    witsmlType: "volumeMeasure",
    documentation: "Accumulator fluid capacity.",
    properties: dataGridUomProperties("volumeUom")
  },
  {
    name: "presAccPreCharge",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Accumulator pre-charge pressure.",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "volAccPreCharge",
    required: false,
    baseType: "double",
    witsmlType: "volumeMeasure",
    documentation: "Accumulator pre-charge volume",
    properties: dataGridUomProperties("volumeUom")
  },
  {
    name: "presAccOpRating",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Accumulator operating pressure rating.",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "typeControlManifold",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Blow Out Preventer Control System."
  },
  {
    name: "descControlManifold",
    required: false,
    baseType: "string",
    witsmlType: "descriptionString",
    maxLength: 256,
    documentation: "Description of control system."
  },
  {
    name: "typeChokeManifold",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Type of choke manifold."
  },
  {
    name: "presChokeManifold",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Choke manifold pressure.",
    properties: dataGridUomProperties("pressureUom")
  }
];
