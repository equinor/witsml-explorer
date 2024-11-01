import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridSurfaceEquipment: DataGridProperty[] = [
  {
    name: "description",
    documentation: "Description of item and details."
  },
  {
    name: "presRating",
    documentation: "Pressure rating of the item.",
    properties: dataGridUomProperties
  },
  {
    name: "typeSurfEquip",
    documentation: "Surface equipment type (IADC1-4,Custom, Coiled Tubing). "
  },
  {
    name: "usePumpDischarge",
    documentation:
      'Use pump discharge Line. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useStandpipe",
    documentation:
      'Use standpipe geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useHose",
    documentation:
      'Use kelly hose geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useSwivel",
    documentation:
      'Use swivel geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useKelly",
    documentation:
      'Use kelly geometry.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useTopStack",
    documentation:
      'Use top stack height.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useInjStack",
    documentation:
      'Use injector stack height.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "useSurfaceIron",
    documentation:
      'Use surface iron description.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "idStandpipe",
    documentation: "Inner diameter of standpipe.",
    properties: dataGridUomProperties
  },
  {
    name: "lenStandpipe",
    documentation: "Length of standpipe.",
    properties: dataGridUomProperties
  },
  {
    name: "idHose",
    documentation: "Inner diameter of kelly hose.",
    properties: dataGridUomProperties
  },
  {
    name: "lenHose",
    documentation: "Length of kelly hose.",
    properties: dataGridUomProperties
  },
  {
    name: "idSwivel",
    documentation: "Inner diameter of swivel.",
    properties: dataGridUomProperties
  },
  {
    name: "lenSwivel",
    documentation: "Length of swivel.",
    properties: dataGridUomProperties
  },
  {
    name: "idKelly",
    documentation: "Inner diameter of kelly hose.",
    properties: dataGridUomProperties
  },
  {
    name: "lenKelly",
    documentation: "Length of kelly.",
    properties: dataGridUomProperties
  },
  {
    name: "idSurfaceIron",
    documentation: "Inner diameter of surface iron.",
    properties: dataGridUomProperties
  },
  {
    name: "lenSurfaceIron",
    documentation: "Length of surface iron.",
    properties: dataGridUomProperties
  },
  {
    name: "htSurfaceIron",
    documentation: "Height of surface iron.",
    properties: dataGridUomProperties
  },
  {
    name: "idDischargeLine",
    documentation: "Coiled tubing - Inner diameter of pump discharge line.",
    properties: dataGridUomProperties
  },
  {
    name: "lenDischargeLine",
    documentation: "Coiled tubing - Length of pump discharge line.",
    properties: dataGridUomProperties
  },
  {
    name: "ctWrapType",
    documentation: "Coiled tubing - Coiled tubing wrap type."
  },
  {
    name: "odReel",
    documentation:
      "Coiled tubing - Specifies the OD of the coiled tubing reel.",
    properties: dataGridUomProperties
  },
  {
    name: "odCore",
    documentation:
      "Coiled tubing - Outer diameter of the reel core that the coiled tubing is wrapped around.",
    properties: dataGridUomProperties
  },
  {
    name: "widReelWrap",
    documentation:
      "Coiled tubing - Width of the reel core. This is the inside dimension.",
    properties: dataGridUomProperties
  },
  {
    name: "lenReel",
    documentation:
      "Coiled tubing - Length of the coiled tubing remaining on the reel.",
    properties: dataGridUomProperties
  },
  {
    name: "injStkUp",
    documentation:
      'Coiled tubing - Injector Stack Up.  Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "htInjStk",
    documentation:
      "Coiled tubing -The length of tubing from the end of the coil reel to the rotary kelly bushing. Basically we define what is in the hole and on the reel. This measurement takes into account the 20 or so feet of tubing that is being straightened and shoved through the injector head.",
    properties: dataGridUomProperties
  },
  {
    name: "umbInside",
    documentation:
      'Coiled tubing - Umbilical inside, true/false check box so that you can account for the wireline inside the coiled tubing.  With this pressure loss calculation, you can calculate for the strings used for logging, wire line coring, etc. Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "odUmbilical",
    documentation: "Coiled tubing - Outer diameter of the umbilical.",
    properties: dataGridUomProperties
  },
  {
    name: "lenUmbilical",
    documentation: "Coiled tubing - Length of the umbilical.",
    properties: dataGridUomProperties
  },
  {
    name: "idTopStk",
    documentation: "Top drive - Inner diameter of top stack.",
    properties: dataGridUomProperties
  },
  {
    name: "htTopStk",
    documentation:
      "Top drive - The distance that the mud travels from the end of the standpipe hose to the drill pipe connection at the bottom of the top drive. We are measuring the distance that the mud will flow through the top drive.",
    properties: dataGridUomProperties
  },
  {
    name: "htFlange",
    documentation:
      "Height of flange. If you select Top Drive Stackup Height, Swivel and Kelly are disabled so that you can specify the top-drive rotary system.",
    properties: dataGridUomProperties
  }
];
