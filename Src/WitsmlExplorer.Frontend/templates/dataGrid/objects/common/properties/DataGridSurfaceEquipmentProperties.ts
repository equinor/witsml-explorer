import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridSurfaceEquipment: DataGridProperty[] = [
  {
    name: "description",
    required: false,
    baseType: "string",
    witsmlType: "commentString",
    maxLength: 4000,
    documentation: "Description of item and details."
  },
  {
    name: "presRating",
    required: false,
    baseType: "double",
    witsmlType: "pressureMeasure",
    documentation: "Pressure rating of the item.",
    properties: dataGridUomProperties("pressureUom")
  },
  {
    name: "typeSurfEquip",
    required: true,
    baseType: "string",
    witsmlType: "surfEquipType",
    maxLength: 50,
    documentation: "Surface equipment type (IADC1-4,Custom, Coiled Tubing). "
  },
  {
    name: "usePumpDischarge",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use pump discharge Line. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useStandpipe",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use standpipe geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useHose",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use kelly hose geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useSwivel",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use swivel geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useKelly",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use kelly geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useTopStack",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use top stack height.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useInjStack",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use injector stack height.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useSurfaceIron",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Use surface iron description.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "idStandpipe",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of standpipe.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenStandpipe",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of standpipe.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idHose",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of kelly hose.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenHose",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of kelly hose.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idSwivel",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of swivel.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenSwivel",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of swivel.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idKelly",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of kelly hose.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenKelly",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of kelly.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idSurfaceIron",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Inner diameter of surface iron.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenSurfaceIron",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Length of surface iron.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "htSurfaceIron",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Height of surface iron.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idDischargeLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Coiled tubing - Inner diameter of pump discharge line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenDischargeLine",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Coiled tubing - Length of pump discharge line.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "ctWrapType",
    required: false,
    baseType: "string",
    witsmlType: "str16",
    maxLength: 16,
    documentation: "Coiled tubing - Coiled tubing wrap type."
  },
  {
    name: "odReel",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Coiled tubing - Specifies the OD of the coiled tubing reel.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "odCore",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Coiled tubing - Outer diameter of the reel core that the coiled tubing is wrapped around.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "widReelWrap",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Coiled tubing - Width of the reel core. This is the inside dimension.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenReel",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Coiled tubing - Length of the coiled tubing remaining on the reel.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "injStkUp",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Coiled tubing - Injector Stack Up.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "htInjStk",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Coiled tubing -The length of tubing from the end of the coil reel to the rotary kelly bushing. Basically we define what is in the hole and on the reel. This measurement takes into account the 20 or so feet of tubing that is being straightened and shoved through the injector head.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "umbInside",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Coiled tubing - Umbilical inside, true/false check box so that you can account for the wireline inside the coiled tubing.  With this pressure loss calculation, you can calculate for the strings used for logging, wire line coring, etc. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "odUmbilical",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Coiled tubing - Outer diameter of the umbilical.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenUmbilical",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Coiled tubing - Length of the umbilical.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "idTopStk",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Top drive - Inner diameter of top stack.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "htTopStk",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Top drive - The distance that the mud travels from the end of the standpipe hose to the drill pipe connection at the bottom of the top drive. We are measuring the distance that the mud will flow through the top drive.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "htFlange",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "Height of flange. If you select Top Drive Stackup Height, Swivel and Kelly are disabled so that you can specify the top-drive rotary system.",
    properties: dataGridUomProperties("lengthUom")
  }
];
