import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionAny } from "templates/dataGrid/objects/common/DataGridExtensionAny";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridCostProperties } from "templates/dataGrid/objects/common/properties/DataGridCostProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridBitRecordProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the node.",
    isAttribute: true
  },
  {
    name: "numBit",
    documentation:
      'Bit number and rerun number e.g. "4.1" for the first rerun of bit 4.'
  },
  {
    name: "diaBit",
    documentation: "Diameter of drilled hole.",
    properties: dataGridUomProperties
  },
  {
    name: "diaPassThru",
    documentation:
      "Minimum hole or tubing which bit will pass through (for bi-center bits).",
    properties: dataGridUomProperties
  },
  {
    name: "diaPilot",
    documentation: "Diameter of pilot bit (for bi-center bits).",
    properties: dataGridUomProperties
  },
  {
    name: "manufacturer",
    documentation: "Manufacturer / supplier of the item."
  },
  {
    name: "typeBit",
    documentation: "Type of bit."
  },
  {
    name: "cost",
    documentation: "Bit cost in local currency.",
    properties: dataGridCostProperties
  },
  {
    name: "codeMfg",
    documentation: "The manufacturers code for the bit."
  },
  {
    name: "codeIADC",
    documentation: "IADC bit code."
  },
  {
    name: "condInitInner",
    documentation: "Condition of inner tooth rows (inner 2/3 of bit) (0-8)."
  },
  {
    name: "condInitOuter",
    documentation: "Condition of outer tooth rows (outer 1/3 of bit) (0-8)."
  },
  {
    name: "condInitDull",
    documentation:
      "Overall dull condition from IADC bit wear 2 character codes."
  },
  {
    name: "condInitLocation",
    documentation:
      "Row and cone numbers for items which need location information (e.g. Cracked Cone, Lost Cone etc)."
  },
  {
    name: "condInitBearing",
    documentation: "Condition of bit bearings (integer 0-8 or E, F, N or X))."
  },
  {
    name: "condInitGauge",
    documentation:
      "Condition of bit gauge in 1/16 of an inch. I = in gauge, else number of 16ths out of gauge."
  },
  {
    name: "condInitOther",
    documentation:
      "Other comments on bit condition from IADC list (BitDullCode in standard list)."
  },
  {
    name: "condInitReason",
    documentation: "Reason bit was pulled from IADC codes."
  },
  {
    name: "condFinalInner",
    documentation: "Condition of inner tooth rows (inner 2/3 of bit) (0-8)."
  },
  {
    name: "condFinalOuter",
    documentation: "Condition of outer tooth rows (outer 1/3 of bit) (0-8)."
  },
  {
    name: "condFinalDull",
    documentation:
      "Overall dull condition from IADC bit wear 2 character codes."
  },
  {
    name: "condFinalLocation",
    documentation:
      "Row and cone numbers for items which need location information (e.g. Cracked Cone, Lost Cone etc)."
  },
  {
    name: "condFinalBearing",
    documentation: "Condition of bit bearings (integer 0-8 or E, F, N or X)."
  },
  {
    name: "condFinalGauge",
    documentation:
      "Condition of bit gauge in 1/16 of a inch. I = in gauge, else number of 16ths out of gauge."
  },
  {
    name: "condFinalOther",
    documentation:
      "Other comments on bit condition from IADC list (BitDullCode in Standard LISTS)."
  },
  {
    name: "condFinalReason",
    documentation: "Reason bit was pulled from IADC codes."
  },
  {
    name: "drive",
    documentation: "Bit drive type (Motor, rotary table etc)."
  },
  {
    name: "bitClass",
    documentation: "N = new, U = used."
  },
  dataGridCustomData,
  dataGridExtensionAny,
  dataGridExtensionNameValue
];
