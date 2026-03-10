import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonTime } from "templates/dataGrid/objects/common/DataGridCommonTime";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridChronostratigraphyStructProperties } from "templates/dataGrid/objects/common/properties/DataGridChronostratigraphyStructProperties";
import { dataGridLithostratigraphyStructProperties } from "templates/dataGrid/objects/common/properties/DataGridLithostratigraphyStructProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridGeologyIntervalProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the geology interval.",
    isAttribute: true
  },
  {
    name: "typeLithology",
    required: true,
    baseType: "string",
    witsmlType: "lithologySource",
    maxLength: 50,
    documentation:
      "The type of lithology declaration. An interpreted type will specify one lithology for the whole interval (i.e., the percentage is 100%). A cuttings or core type may specify one or more lithologies for the interval based on a visual inspection of the cuttings or core and a relative percentage will be assigned to each lithology."
  },
  {
    name: "mdTop",
    required: true,
    baseType: "double",
    witsmlType: "measuredDepthCoord",
    documentation:
      'Measured depth at top of interval. This is an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "mdBottom",
    required: true,
    baseType: "double",
    witsmlType: "measuredDepthCoord",
    documentation:
      'Measured depth at base of interval. A point interval should be indicated by setting mdTop=mdBottom. This is an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "dTim",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation:
      "Date and time the information is related to. The time refers to the top of the interval."
  },
  {
    name: "tvdTop",
    required: false,
    baseType: "double",
    witsmlType: "wellVerticalDepthCoord",
    documentation: "True vertical depth at top of the section.",
    properties: dataGridWellVerticalDepthCoordProperties
  },
  {
    name: "tvdBase",
    required: false,
    baseType: "double",
    witsmlType: "wellVerticalDepthCoord",
    documentation: "True vertical depth at base of interval.",
    properties: dataGridWellVerticalDepthCoordProperties
  },
  {
    name: "ropAv",
    required: false,
    baseType: "double",
    witsmlType: "velocityMeasure",
    documentation: "Average rate of penetration through Interval.",
    properties: dataGridUomProperties("velocityUom")
  },
  {
    name: "ropMn",
    required: false,
    baseType: "double",
    witsmlType: "velocityMeasure",
    documentation: "Minimum rate of penetration through Interval.",
    properties: dataGridUomProperties("velocityUom")
  },
  {
    name: "ropMx",
    required: false,
    baseType: "double",
    witsmlType: "velocityMeasure",
    documentation: "Maximum rate of penetration through Interval.",
    properties: dataGridUomProperties("velocityUom")
  },
  {
    name: "wobAv",
    required: false,
    baseType: "double",
    witsmlType: "forceMeasure",
    documentation: "Surface weight on bit - average through interval.",
    properties: dataGridUomProperties("forceUom")
  },
  {
    name: "tqAv",
    required: false,
    baseType: "double",
    witsmlType: "momentOfForceMeasure",
    documentation: "Average torque through interval.",
    properties: dataGridUomProperties("momentOfForceUom")
  },
  {
    name: "currentAv",
    required: false,
    baseType: "double",
    witsmlType: "electricCurrentMeasure",
    documentation:
      "Average current through interval. This is the raw measurement from which the average torque could be calculated.",
    properties: dataGridUomProperties("electricCurrentUom")
  },
  {
    name: "rpmAv",
    required: false,
    baseType: "double",
    witsmlType: "anglePerTimeMeasure",
    documentation: "Average turn rate through interval (commonly in rpm).",
    properties: dataGridUomProperties("anglePerTimeUom")
  },
  {
    name: "wtMudAv",
    required: false,
    baseType: "double",
    witsmlType: "densityMeasure",
    documentation: "Average mud density in through interval.",
    properties: dataGridUomProperties("densityUom")
  },
  {
    name: "ecdTdAv",
    required: false,
    baseType: "double",
    witsmlType: "densityMeasure",
    documentation:
      "Average effective circulating density at TD through Interval.",
    properties: dataGridUomProperties("densityUom")
  },
  {
    name: "dxcAv",
    required: false,
    baseType: "double",
    witsmlType: "unitlessQuantity",
    documentation: "Average drilling exponent through Interval."
  },
  {
    name: "lithology",
    required: false,
    witsmlType: "cs_lithology",
    documentation: "Set of lithology records for the Interval.",
    isContainer: true,
    isMultiple: true,
    properties: [
      {
        name: "uid",
        required: false,
        baseType: "string",
        witsmlType: "uidString",
        maxLength: 64,
        documentation: "Unique identifier for the lithology object.",
        isAttribute: true
      },
      {
        name: "type",
        required: true,
        baseType: "string",
        witsmlType: "lithologyType",
        maxLength: 50,
        documentation:
          "The geological name for the type of lithology from the enum table listing a subset of the OneGeology / CGI defined formation types."
      },
      {
        name: "codeLith",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation:
          "A custom Lithology encoding sceme if desired.(It is recommended that if used, this follows the NPD required useage with the numeric values noted in the enum tables, which was the original intent for this item). The NPD Coding System assigned a digital code to the main lithologies as per the Norwegian Blue Book data standards.The code was then derived by Lithology = (Main lithology * 10) + cement + (modifier / 100).Example: Calcite cemented silty micaceous sandstone: ( 33 * 10 ) + 1 + (21 / 100) gives a numeric code of 331.21.However the NPD is also working through Energistics/Ceasar to potentially change this useage.)This should not be used for mnemonics, as those vary by operator, and if an abbreviation is required a local look up table should be used by the rendering client, based on Lithology Type."
      },
      {
        name: "lithPc",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasurePercent",
        documentation:
          'The lithology represents the portion of the sampled interval this lithology type relates to.The total of the lithologies within an interval should add up to 100 percent.If LithologySource in cs-geology is "interpreted" only 100% is allowed.If "core" or "cuttings" then recommended useage is the creating application uses blocks of 10%. i.e. 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.Ideally the input application should enforce a total of 100% for every defined depth interval.If the total for a depth interval does not add up to 100%, the "undifferentiated" code should be used to fill out to 100%.',
        properties: dataGridUomProperties("percentUom")
      },
      {
        name: "description",
        required: false,
        baseType: "string",
        witsmlType: "commentString",
        maxLength: 4000,
        documentation:
          "Free text sample description of item and details, using a structured approach as per AAPG and Shell style,or specific operator descriptive hierarchy typically in the order of Rock Type, Qualifier,colour, Texture, Cement matrix type, compaction, Fracture, accessories, fossils, structure porosity, Shows.This should be blank if a structured approach to creating the description is used.Example clastic descriptions: SST, qtz, wh lt gy grn, m - c g, well sort, subrnd-subang, sub sph - sph, grst tex, wk calc cmt,fria, glauc rr mica, gd vis por, patchy dk brn oil stn, wk yel dir fluor, bri yel cut fluor, instant blooming yel-wh crush cut fluor, dk brn cut col.Example carbonate description: LST; wh buff lt brn, m-c g, bioclastic grst, xln cmt, hd, ang brk, tr pyr, poor vis por."
      },
      {
        name: "lithClass",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "DEPRECATED. Lithology classification description.(In the past this was intended to distinguish between alternative classification schemes such as Dunham or Folk.This is no longer necessary with the classifications included in Lithology Type)"
      },
      {
        name: "grainType",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation: "DEPRECATED. Use sizeGrain below. Granulometry."
      },
      {
        name: "dunhamClass",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "DEPRECATED. Dunham / Embry and Klovan limestone classification.No longer used, as the terms are available as alternates for carbonates within the Lithology type.i.e. A Dunham defined lithology will be plotted graphically as a limestone, but the Dunham terminology will be available to use in a structured description."
      },
      {
        name: "color",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology color description, from Shell 1995 4.3.3.1 and 4.3.3.2 Colourswith the addition of Frosted. eg black blue brown buff green grey olive orange pink purple red translucent frosted white yellow,modified by dark, light, moderate, medium, mottled, variegated, slight, weak, strong, vivid."
      },
      {
        name: "texture",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology matrix texture description from Shell 1995 4.3.2.6.crystalline, (often "feather-edge" appearance on breaking), friable, dull, earthy, chalky, (particle size less than 20m; often exhibits capillary imbibition) visibly particulate, granular, sucrosic, (often exhibits capillary imbibition).e.g.: compact interlocking, particulate, (Gradational textures are quite common,) chalky matrix with sucrosic patches, (Composite textures also occur)'
      },
      {
        name: "hardness",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Mineral hardness.(Typically this will rarely be used as mineral hardness is not typically recorded.What is recorded is typically compaction. It is retained though for use defined as per Mohs scale of mineral hardness.)"
      },
      {
        name: "compaction",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology compaction from Shell 1995 4.3.1.5.not compacted, slightly compacted, compacted, strongly compacted, friable, indurated, hard."
      },
      {
        name: "sizeGrain",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology grain size description. Defined from Shell 4.3.1.1.(Wentworth) modified to remove the ambiguous term Pelite. Size ranges in millimeter (or micrometer) and Inches. LT 256 mm LT 10.1 in  "boulder";64-256 mm 2.5-10.1 in "cobble"; 32-64 mm 1.26-2.5 in "very coarse gravel"; 16-32 mm 0.63-1.26 in "coarse gravel"; 8-16 mm 0.31-0.63 in "medium gravel"; 4-8 mm 0.157-0.31 in "fine gravel";2-4 mm 0.079-0.157 in "very fine gravel"; 1-2 mm 0.039-0.079 in "very coarse sand"; 0.5-1 mm 0.020-0.039 in "coarse sand"; 0.25-0.5 mm 0.010-0.020 in "medium sand"; 125-250 um 0.0049-0.010 in "fine sand"; 62.5-125 um 0.0025-0.0049 in "very fine sand"; 3.90625-62.5 um 0.00015-0.0025 in "silt"; LT 3.90625 um LT 0.00015 in "clay"; LT 1 um LT 0.000039 in  "colloid"'
      },
      {
        name: "roundness",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology roundness description from Shell 4.3.1.3 Roundness (roundness refers to modal size class).very angular, angular, subangular, subrounded, rounded, well rounded."
      },
      {
        name: "sphericity",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology sphericity description for the modal size class of grains in the sample, defined as per Shell 4.3.1.4 Sphericity.very elongated, elongated, slightly elongated, slightly spherical, spherical, very spherical"
      },
      {
        name: "sorting",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology sorting descriptione from Shell 4.3.1.2 Sorting.very poorly sorted, unsorted, poorly sorted, poorly to moderately well sorted, moderately well sorted, well sorted, very well sorted, unimodally sorted, bimodally sorted."
      },
      {
        name: "matrixCement",
        required: false,
        baseType: "string",
        witsmlType: "matrixCementType",
        maxLength: 50,
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology matrix/cement description. Terms will be as defined in the enumeration table.eg. "calcite" (Common) "dolomite", "ankerite" (eg. North Sea HPHT reservoirs such as Elgin and Franklin have almost pure Ankerite cementation,"siderite" (Sherwood sandstones, southern UK typical Siderite cements), "quartz" (grain to grain contact cementation or secondary quartz deposition),"kaolinite", "illite" (eg. Village Fields North Sea), "smectite","chlorite" (Teg, Algeria.)'
      },
      {
        name: "porosityVisible",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology visible porosity description.Defined after BakerHughes definitions, as opposed to Shell, which has no linkage to actual numeric estimates.The theoretical maximum porosity for a clastic rock is about 26%. This is normally much reduced by other factors.When estimating porosities use: MT 15% "good" 10 to 15% "fair" 5 to 10% "poor" LT 5% "trace" 0 "none"'
      },
      {
        name: "porosityFabric",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Visible porosity fabric description from after Shell 4.3.2.1 and 4.3.2.2.intergranular (particle size greater than 20m), fine interparticle (particle size less than 20m), intercrystalline, intragranular, intraskeletal,intracrystalline, mouldic, fenestral, shelter, framework, stylolitic, replacement, solution, vuggy, channel, cavernous."
      },
      {
        name: "permeability",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology permeability description from Shell 4.3.2.5.In future these would benefit from quantification. tight, slightly, fairly, highly."
      },
      {
        name: "densShale",
        required: false,
        baseType: "double",
        witsmlType: "densityMeasure",
        documentation:
          "DEPRECATED. This entry for shale density should not be used. Shale densities should be entered in the Shale Density in cs_geologyInterval.",
        properties: dataGridUomProperties("densityUom")
      },
      {
        name: "qualifier",
        required: false,
        witsmlType: "cs_qualifier",
        documentation:
          'A single qualifier from the Qualifier enum table for graphical representation in the Lithology columns.In mudlogging terms, a qualifier is a graphical symbol in the Interpreted Lithology column of the Formation Evaluation Log (aka "the mudlog").In addition to the major lithologies (e.g., sand, shale, etc) existing in the sample,other minerals (present as accessories or inclusions e.g. chert, pyrite, glauconite) and fossils (forams, oyster shells, bryozoans, etc.) may existand their abundance is generally categorized using ranges such as Trace.These additional minerals and fossils can be of disproportionately great diagnostic and descriptive value.For example,qualifiers can be used to indicate facies changes, marker beds or something that impacted drilling conditions.These qualifiers (representing accessories, inclusions and/or fossils) are used to rapidly and graphically indicate to the recipient of the mudlogthat a significant lithological event was encountered while drilling the well.The qualifier can also be used in creating the structured descriptions.',
        isContainer: true,
        isMultiple: true,
        properties: [
          {
            name: "uid",
            required: false,
            baseType: "string",
            witsmlType: "uidString",
            maxLength: 64,
            documentation: "Unique identifier for the lithology qualifier.",
            isAttribute: true
          },
          {
            name: "type",
            required: true,
            baseType: "string",
            witsmlType: "qualifierType",
            maxLength: 50,
            documentation: "The type of qualifier."
          },
          {
            name: "mdTop",
            required: false,
            baseType: "double",
            witsmlType: "measuredDepthCoord",
            documentation:
              "The measured depth at the top of the interval represented by the qualifier. This must be within the range of the parent geologic interval. If mdTop and mdBottom are not given then the qualifier is deemed to exist over the depth range of the parent geologyInterval.",
            properties: dataGridMeasuredDepthCoordProperties
          },
          {
            name: "mdBottom",
            required: false,
            baseType: "double",
            witsmlType: "measuredDepthCoord",
            documentation:
              "The measured depth at the bottom of the interval represented by the qualifier. A point can be indicated by specifying bottom=top. This must be within the range of the parent geologic interval.",
            properties: dataGridMeasuredDepthCoordProperties
          },
          {
            name: "abundance",
            required: false,
            baseType: "double",
            witsmlType: "volumePerVolumeMeasurePercent",
            documentation:
              'The relative abundance of the qualifier estimated based on a "visual area" basis by inspecting the cuttings spread out on the shaker table prior to washing, or in the sample tray after washing. This represents the upper bound of the observed range, and is in the following increments at the upper bound. 1 = less than or equal to 1%, 2 = greater than or equal to 1 and less than 2%, 5 = greater than or equal to 2 and less than 5% and then in 5% increments, 10 (=5-10%), 15 (=10-15%) up to 100(=95-100%). The end user can then elect to either display the %, or map then to an operator specific term or coding, i.e. 1 less then or equal to 1%=Rare Trace, or occasional, or very sparse etc., depending on the the end users\' terminology.) ',
            properties: dataGridUomProperties("percentUom")
          },
          {
            name: "abundanceCode",
            required: false,
            baseType: "string",
            witsmlType: "kindString",
            maxLength: 50,
            documentation:
              "DEPRECATED. This prior useage for a specific terminology is suggested to no longer be used, as the intent should be to avoid encoding proprietary terms. But, for the sake of interoperability, proprietary descriptive use of a specific term for a percentage, should be derived from the abundance % by the end users' visualization application, using the end users' terminology. (i.e. if 1 less than or equal to 1% = Rare Trace or equivalent terminology for the specific operator; this can be mapped in the end user application, but is redundant to be encoded in the standard.)"
          },
          {
            name: "description",
            required: false,
            baseType: "string",
            witsmlType: "descriptionString",
            maxLength: 256,
            documentation: "A textual description of the qualifier."
          },
          dataGridExtensionNameValue
        ]
      },
      dataGridExtensionNameValue
    ]
  },
  {
    name: "show",
    required: false,
    witsmlType: "cs_show",
    documentation: "Show record through the Interval.",
    isContainer: true,
    properties: [
      {
        name: "showRat",
        required: false,
        baseType: "string",
        witsmlType: "showRating",
        maxLength: 50,
        documentation: "Show Rating."
      },
      {
        name: "stainColor",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Visible Stain Color."
      },
      {
        name: "stainDistr",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Visible Stain Distribution."
      },
      {
        name: "stainPc",
        required: false,
        baseType: "double",
        witsmlType: "areaPerAreaMeasure",
        documentation: "Visible Stain (commonly in percent).",
        properties: dataGridUomProperties("areaPerAreaUom")
      },
      {
        name: "natFlorColor",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Natural Fluorescence Color."
      },
      {
        name: "natFlorPc",
        required: false,
        baseType: "double",
        witsmlType: "areaPerAreaMeasure",
        documentation: "Natural fluorescence (commonly in percent).",
        properties: dataGridUomProperties("areaPerAreaUom")
      },
      {
        name: "natFlorLevel",
        required: false,
        baseType: "string",
        witsmlType: "showFluorescence",
        maxLength: 50,
        documentation: "Natural fluorescence level."
      },
      {
        name: "natFlorDesc",
        required: false,
        baseType: "string",
        witsmlType: "shortDescriptionString",
        maxLength: 64,
        documentation: "Natural fluorescence description."
      },
      {
        name: "cutColor",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Cut color."
      },
      {
        name: "cutSpeed",
        required: false,
        baseType: "string",
        witsmlType: "showSpeed",
        maxLength: 50,
        documentation: "Cut speed."
      },
      {
        name: "cutStrength",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Cut strength."
      },
      {
        name: "cutForm",
        required: false,
        baseType: "string",
        witsmlType: "showLevel",
        maxLength: 50,
        documentation: "Cut formulation."
      },
      {
        name: "cutLevel",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Cut level (Faint, Bright, etc.)."
      },
      {
        name: "cutFlorColor",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Cut fluorescence color."
      },
      {
        name: "cutFlorSpeed",
        required: false,
        baseType: "string",
        witsmlType: "showSpeed",
        maxLength: 50,
        documentation: "Cut fluorescence speed."
      },
      {
        name: "cutFlorStrength",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Cut fluorescence strength."
      },
      {
        name: "cutFlorForm",
        required: false,
        baseType: "string",
        witsmlType: "showLevel",
        maxLength: 50,
        documentation: "Cut fluorescence form."
      },
      {
        name: "cutFlorLevel",
        required: false,
        baseType: "string",
        witsmlType: "showFluorescence",
        maxLength: 50,
        documentation: "Cut fluorescence level."
      },
      {
        name: "residueColor",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Residue color."
      },
      {
        name: "showDesc",
        required: false,
        baseType: "string",
        witsmlType: "commentString",
        maxLength: 4000,
        documentation: "Free format show description."
      },
      {
        name: "impregnatedLitho",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation: "Impregnated lithology."
      },
      {
        name: "odor",
        required: false,
        baseType: "string",
        witsmlType: "str32",
        maxLength: 32,
        documentation: "Description of any hydrocarbon type odors smelled."
      }
    ]
  },
  {
    name: "chromatograph",
    required: false,
    witsmlType: "cs_chromatograph",
    documentation: "Chromatographic break down for the interval.",
    isContainer: true,
    properties: [
      {
        name: "dTim",
        required: false,
        baseType: "dateTime",
        witsmlType: "timestamp",
        documentation:
          "The date and time at which the gas sample was processed."
      },
      {
        name: "mdTop",
        required: false,
        baseType: "double",
        witsmlType: "measuredDepthCoord",
        documentation: "Measured depth at top of Interval.",
        properties: dataGridMeasuredDepthCoordProperties
      },
      {
        name: "mdBottom",
        required: false,
        baseType: "double",
        witsmlType: "measuredDepthCoord",
        documentation: "Measured depth at base of interval.",
        properties: dataGridMeasuredDepthCoordProperties
      },
      {
        name: "wtMudIn",
        required: false,
        baseType: "double",
        witsmlType: "densityMeasure",
        documentation: "Mud density in (active pits).",
        properties: dataGridUomProperties("densityUom")
      },
      {
        name: "wtMudOut",
        required: false,
        baseType: "double",
        witsmlType: "densityMeasure",
        documentation: "Mud density out (flowline).",
        properties: dataGridUomProperties("densityUom")
      },
      {
        name: "chromType",
        required: false,
        baseType: "string",
        witsmlType: "str16",
        maxLength: 16,
        documentation: "Chromatograph type."
      },
      {
        name: "eTimChromCycle",
        required: false,
        baseType: "double",
        witsmlType: "timeMeasure",
        documentation: "Chromatograph cycle time. Commonly in seconds.",
        properties: dataGridUomProperties("timeUom")
      },
      {
        name: "chromIntRpt",
        required: false,
        baseType: "dateTime",
        witsmlType: "timestamp",
        documentation:
          "Chromatograph integrator report time, format may be variable due to recording equipment "
      },
      {
        name: "methAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Methane (C1) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "methMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Methane (C1) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "methMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Methane (C1) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ethAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Ethane (C2) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ethMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Ethane (C2) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ethMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Ethane (C2) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "propAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Propane (C3) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "propMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Propane (C3) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "propMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Propane (C3) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ibutAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Butane (iC4) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ibutMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Butane (iC4) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ibutMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Butane (iC4) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "nbutAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Butane (nC4) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "nbutMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Butane (nC4) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "nbutMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Butane (nC4) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ipentAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Pentane (iC5) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ipentMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Pentane (iC5) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ipentMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Pentane (iC5) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "npentAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Pentane (nC5) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "npentMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Pentane (nC5) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "npentMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Pentane (nC5) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "epentAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "neo-Pentane (eC5) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "epentMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "neo-Pentane (eC5) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "epentMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "neo-Pentane (eC5) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ihexAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Hexane (iC6) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ihexMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Hexane (iC6) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "ihexMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "iso-Hexane (iC6) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "nhexAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Hexane (nC6) ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "nhexMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Hexane (nC6) ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "nhexMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "nor-Hexane (nC6) ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "co2Av",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Carbon Dioxide ppm (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "co2Mn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Carbon Dioxide ppm (minimum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "co2Mx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Carbon Dioxide ppm (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "h2sAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Hydrogen Sulfide (average) ppm.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "h2sMn",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Hydrogen Sulfide (minimum) ppm.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "h2sMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Hydrogen Sulfide (maximum) ppm.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "acetylene",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Acetylene.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      }
    ]
  },
  {
    name: "mudGas",
    required: false,
    witsmlType: "cs_mudGas",
    documentation: "Total gas readings associated with this interval.",
    isContainer: true,
    properties: [
      {
        name: "gasAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Average total gas.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "gasPeak",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Peak gas reading.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "gasPeakType",
        required: false,
        baseType: "string",
        witsmlType: "gasPeakType",
        maxLength: 50,
        documentation: "Type of gas peak."
      },
      {
        name: "gasBackgnd",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Background gas reading.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "gasConAv",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Connection gas (average).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "gasConMx",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Connection gas (maximum).",
        properties: dataGridUomProperties("volumePerVolumeUom")
      },
      {
        name: "gasTrip",
        required: false,
        baseType: "double",
        witsmlType: "volumePerVolumeMeasure",
        documentation: "Trip gas last reading.",
        properties: dataGridUomProperties("volumePerVolumeUom")
      }
    ]
  },
  {
    name: "densBulk",
    required: false,
    baseType: "double",
    witsmlType: "densityMeasure",
    documentation: "Sample bulk density for the interval.",
    properties: dataGridUomProperties("densityUom")
  },
  {
    name: "densShale",
    required: false,
    baseType: "double",
    witsmlType: "densityMeasure",
    documentation: "Shale density for the interval.",
    properties: dataGridUomProperties("densityUom")
  },
  {
    name: "calcite",
    required: false,
    baseType: "double",
    witsmlType: "volumePerVolumeMeasure",
    documentation: "Calcimetry calcite percentage.",
    properties: dataGridUomProperties("volumePerVolumeUom")
  },
  {
    name: "dolomite",
    required: false,
    baseType: "double",
    witsmlType: "volumePerVolumeMeasure",
    documentation: "Calcimetry dolomite percentage.",
    properties: dataGridUomProperties("volumePerVolumeUom")
  },
  {
    name: "cec",
    required: false,
    baseType: "double",
    witsmlType: "equivalentPerMassMeasure",
    documentation: "Cuttings cationic exchange capacity.",
    properties: dataGridUomProperties("equivalentPerMassUom")
  },
  {
    name: "qft",
    required: false,
    baseType: "double",
    witsmlType: "illuminanceMeasure",
    documentation:
      "Fluorescence as measured using a device licensed for the Quantitative Fluorescence Technique.",
    properties: dataGridUomProperties("illuminanceUom")
  },
  {
    name: "calcStab",
    required: false,
    baseType: "double",
    witsmlType: "volumePerVolumeMeasure",
    documentation: "Calcimetry stabilized percentage.",
    properties: dataGridUomProperties("volumePerVolumeUom")
  },
  {
    name: "nameFormation",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation:
      "DEPRECATED. Formerly defined as name of formation penetrated, now deprecated to be replaced by lithostratigraphic with kind=formation.",
    isMultiple: true
  },
  {
    name: "lithostratigraphic",
    required: false,
    baseType: "string",
    witsmlType: "lithostratigraphyStruct",
    maxLength: 64,
    documentation: "Name of lithostratigraphy, regionally dependent.",
    isMultiple: true,
    properties: dataGridLithostratigraphyStructProperties
  },
  {
    name: "chronostratigraphic",
    required: false,
    baseType: "string",
    witsmlType: "chronostratigraphyStruct",
    maxLength: 64,
    documentation: "Chronostratigraphic classification.",
    isMultiple: true,
    properties: dataGridChronostratigraphyStructProperties
  },
  {
    name: "sizeMn",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Minimum size.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "sizeMx",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Maximum size.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "lenPlug",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Plug length.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "description",
    required: false,
    baseType: "string",
    witsmlType: "commentString",
    maxLength: 4000,
    documentation: "Description of item and details."
  },
  {
    name: "cuttingFluid",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Sample treatment : cutting fluid."
  },
  {
    name: "cleaningMethod",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Sample treatment : cleaning method."
  },
  {
    name: "dryingMethod",
    required: false,
    baseType: "string",
    witsmlType: "str32",
    maxLength: 32,
    documentation: "Sample treatment : drying method."
  },
  {
    name: "comments",
    required: false,
    baseType: "string",
    witsmlType: "commentString",
    maxLength: 4000,
    documentation: "Comments and remarks."
  },
  dataGridCommonTime,
  dataGridExtensionNameValue
];
