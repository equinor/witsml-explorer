import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionAny } from "templates/dataGrid/objects/common/DataGridExtensionAny";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridCostProperties } from "templates/dataGrid/objects/common/properties/DataGridCostProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridBitRecordProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the node.",
    isAttribute: true
  },
  {
    name: "numBit",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      'Bit number and rerun number e.g. "4.1" for the first rerun of bit 4.'
  },
  {
    name: "diaBit",
    required: true,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Diameter of drilled hole.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "diaPassThru",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Minimum hole or tubing which bit will pass through (for bi-center bits).",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "diaPilot",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Diameter of pilot bit (for bi-center bits).",
    properties: dataGridUomProperties("lengthUom")
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
    name: "typeBit",
    required: false,
    baseType: "string",
    witsmlType: "bitType",
    maxLength: 50,
    documentation: "Type of bit."
  },
  {
    name: "cost",
    required: false,
    baseType: "double",
    witsmlType: "cost",
    documentation: "Bit cost in local currency.",
    properties: dataGridCostProperties
  },
  {
    name: "codeMfg",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "The manufacturers code for the bit."
  },
  {
    name: "codeIADC",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "IADC bit code."
  },
  {
    name: "condInitInner",
    required: false,
    baseType: "int",
    witsmlType: "iadcIntegerCode",
    documentation: "Condition of inner tooth rows (inner 2/3 of bit) (0-8)."
  },
  {
    name: "condInitOuter",
    required: false,
    baseType: "int",
    witsmlType: "iadcIntegerCode",
    documentation: "Condition of outer tooth rows (outer 1/3 of bit) (0-8)."
  },
  {
    name: "condInitDull",
    required: false,
    baseType: "string",
    witsmlType: "bitDullCode",
    maxLength: 50,
    documentation:
      "Overall dull condition from IADC bit wear 2 character codes."
  },
  {
    name: "condInitLocation",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      "Row and cone numbers for items which need location information (e.g. Cracked Cone, Lost Cone etc)."
  },
  {
    name: "condInitBearing",
    required: false,
    baseType: "string",
    witsmlType: "iadcBearingWearCode",
    maxLength: 50,
    documentation: "Condition of bit bearings (integer 0-8 or E, F, N or X))."
  },
  {
    name: "condInitGauge",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      "Condition of bit gauge in 1/16 of an inch. I = in gauge, else number of 16ths out of gauge."
  },
  {
    name: "condInitOther",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      "Other comments on bit condition from IADC list (BitDullCode in standard list)."
  },
  {
    name: "condInitReason",
    required: false,
    baseType: "string",
    witsmlType: "bitReasonPulled",
    maxLength: 50,
    documentation: "Reason bit was pulled from IADC codes."
  },
  {
    name: "condFinalInner",
    required: false,
    baseType: "int",
    witsmlType: "iadcIntegerCode",
    documentation: "Condition of inner tooth rows (inner 2/3 of bit) (0-8)."
  },
  {
    name: "condFinalOuter",
    required: false,
    baseType: "int",
    witsmlType: "iadcIntegerCode",
    documentation: "Condition of outer tooth rows (outer 1/3 of bit) (0-8)."
  },
  {
    name: "condFinalDull",
    required: false,
    baseType: "string",
    witsmlType: "bitDullCode",
    maxLength: 50,
    documentation:
      "Overall dull condition from IADC bit wear 2 character codes."
  },
  {
    name: "condFinalLocation",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      "Row and cone numbers for items which need location information (e.g. Cracked Cone, Lost Cone etc)."
  },
  {
    name: "condFinalBearing",
    required: false,
    baseType: "string",
    witsmlType: "iadcBearingWearCode",
    maxLength: 50,
    documentation: "Condition of bit bearings (integer 0-8 or E, F, N or X)."
  },
  {
    name: "condFinalGauge",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      "Condition of bit gauge in 1/16 of a inch. I = in gauge, else number of 16ths out of gauge."
  },
  {
    name: "condFinalOther",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation:
      "Other comments on bit condition from IADC list (BitDullCode in Standard LISTS)."
  },
  {
    name: "condFinalReason",
    required: false,
    baseType: "string",
    witsmlType: "bitReasonPulled",
    maxLength: 50,
    documentation: "Reason bit was pulled from IADC codes."
  },
  {
    name: "drive",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Bit drive type (Motor, rotary table etc)."
  },
  {
    name: "bitClass",
    required: false,
    baseType: "string",
    witsmlType: "str2",
    maxLength: 2,
    documentation: "N = new, U = used."
  },
  dataGridCustomData,
  dataGridExtensionAny,
  dataGridExtensionNameValue
];
