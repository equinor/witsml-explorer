import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridChronostratigraphyStructProperties } from "templates/dataGrid/objects/common/properties/DataGridChronostratigraphyStructProperties";
import { dataGridLithostratigraphyStructProperties } from "templates/dataGrid/objects/common/properties/DataGridLithostratigraphyStructProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridGeologyIntervalProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the geology interval.",
    isAttribute: true
  },
  {
    name: "typeLithology",
    documentation:
      "The type of lithology declaration. An interpreted type will specify one lithology for the whole interval (i.e., the percentage is 100%). A cuttings or core type may specify one or more lithologies for the interval based on a visual inspection of the cuttings or core and a relative percentage will be assigned to each lithology."
  },
  {
    name: "mdTop",
    documentation:
      'Measured depth at top of interval. This is an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "mdBottom",
    documentation:
      'Measured depth at base of interval. A point interval should be indicated by setting mdTop=mdBottom. This is an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "dTim",
    documentation:
      "Date and time the information is related to. The time refers to the top of the interval."
  },
  {
    name: "tvdTop",
    documentation: "True vertical depth at top of the section.",
    properties: dataGridWellVerticalDepthCoordProperties
  },
  {
    name: "tvdBase",
    documentation: "True vertical depth at base of interval.",
    properties: dataGridWellVerticalDepthCoordProperties
  },
  {
    name: "ropAv",
    documentation: "Average rate of penetration through Interval.",
    properties: dataGridUomProperties
  },
  {
    name: "ropMn",
    documentation: "Minimum rate of penetration through Interval.",
    properties: dataGridUomProperties
  },
  {
    name: "ropMx",
    documentation: "Maximum rate of penetration through Interval.",
    properties: dataGridUomProperties
  },
  {
    name: "wobAv",
    documentation: "Surface weight on bit - average through interval.",
    properties: dataGridUomProperties
  },
  {
    name: "tqAv",
    documentation: "Average torque through interval.",
    properties: dataGridUomProperties
  },
  {
    name: "currentAv",
    documentation:
      "Average current through interval. This is the raw measurement from which the average torque could be calculated.",
    properties: dataGridUomProperties
  },
  {
    name: "rpmAv",
    documentation: "Average turn rate through interval (commonly in rpm).",
    properties: dataGridUomProperties
  },
  {
    name: "wtMudAv",
    documentation: "Average mud density in through interval.",
    properties: dataGridUomProperties
  },
  {
    name: "ecdTdAv",
    documentation:
      "Average effective circulating density at TD through Interval.",
    properties: dataGridUomProperties
  },
  {
    name: "dxcAv",
    documentation: "Average drilling exponent through Interval."
  },
  {
    name: "lithology",
    documentation: "Set of lithology records for the Interval.",
    isContainer: true,
    isMultiple: true,
    properties: [
      {
        name: "uid",
        documentation: "Unique identifier for the lithology object.",
        isAttribute: true
      },
      {
        name: "type",
        documentation:
          "The geological name for the type of lithology from the enum table listing a subset of the OneGeology / CGI defined formation types."
      },
      {
        name: "codeLith",
        documentation:
          "A custom Lithology encoding sceme if desired.(It is recommended that if used, this follows the NPD required useage with the numeric values noted in the enum tables, which was the original intent for this item). The NPD Coding System assigned a digital code to the main lithologies as per the Norwegian Blue Book data standards.The code was then derived by Lithology = (Main lithology * 10) + cement + (modifier / 100).Example: Calcite cemented silty micaceous sandstone: ( 33 * 10 ) + 1 + (21 / 100) gives a numeric code of 331.21.However the NPD is also working through Energistics/Ceasar to potentially change this useage.)This should not be used for mnemonics, as those vary by operator, and if an abbreviation is required a local look up table should be used by the rendering client, based on Lithology Type."
      },
      {
        name: "lithPc",
        documentation:
          'The lithology represents the portion of the sampled interval this lithology type relates to.The total of the lithologies within an interval should add up to 100 percent.If LithologySource in cs-geology is "interpreted" only 100% is allowed.If "core" or "cuttings" then recommended useage is the creating application uses blocks of 10%. i.e. 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.Ideally the input application should enforce a total of 100% for every defined depth interval.If the total for a depth interval does not add up to 100%, the "undifferentiated" code should be used to fill out to 100%.',
        properties: dataGridUomProperties
      },
      {
        name: "description",
        documentation:
          "Free text sample description of item and details, using a structured approach as per AAPG and Shell style,or specific operator descriptive hierarchy typically in the order of Rock Type, Qualifier,colour, Texture, Cement matrix type, compaction, Fracture, accessories, fossils, structure porosity, Shows.This should be blank if a structured approach to creating the description is used.Example clastic descriptions: SST, qtz, wh lt gy grn, m - c g, well sort, subrnd-subang, sub sph - sph, grst tex, wk calc cmt,fria, glauc rr mica, gd vis por, patchy dk brn oil stn, wk yel dir fluor, bri yel cut fluor, instant blooming yel-wh crush cut fluor, dk brn cut col.Example carbonate description: LST; wh buff lt brn, m-c g, bioclastic grst, xln cmt, hd, ang brk, tr pyr, poor vis por."
      },
      {
        name: "lithClass",
        documentation:
          "DEPRECATED. Lithology classification description.(In the past this was intended to distinguish between alternative classification schemes such as Dunham or Folk.This is no longer necessary with the classifications included in Lithology Type)"
      },
      {
        name: "grainType",
        documentation: "DEPRECATED. Use sizeGrain below. Granulometry."
      },
      {
        name: "dunhamClass",
        documentation:
          "DEPRECATED. Dunham / Embry and Klovan limestone classification.No longer used, as the terms are available as alternates for carbonates within the Lithology type.i.e. A Dunham defined lithology will be plotted graphically as a limestone, but the Dunham terminology will be available to use in a structured description."
      },
      {
        name: "color",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology color description, from Shell 1995 4.3.3.1 and 4.3.3.2 Colourswith the addition of Frosted. eg black blue brown buff green grey olive orange pink purple red translucent frosted white yellow,modified by dark, light, moderate, medium, mottled, variegated, slight, weak, strong, vivid."
      },
      {
        name: "texture",
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology matrix texture description from Shell 1995 4.3.2.6.crystalline, (often "feather-edge" appearance on breaking), friable, dull, earthy, chalky, (particle size less than 20m; often exhibits capillary imbibition) visibly particulate, granular, sucrosic, (often exhibits capillary imbibition).e.g.: compact interlocking, particulate, (Gradational textures are quite common,) chalky matrix with sucrosic patches, (Composite textures also occur)'
      },
      {
        name: "hardness",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Mineral hardness.(Typically this will rarely be used as mineral hardness is not typically recorded.What is recorded is typically compaction. It is retained though for use defined as per Mohs scale of mineral hardness.)"
      },
      {
        name: "compaction",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology compaction from Shell 1995 4.3.1.5.not compacted, slightly compacted, compacted, strongly compacted, friable, indurated, hard."
      },
      {
        name: "sizeGrain",
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology grain size description. Defined from Shell 4.3.1.1.(Wentworth) modified to remove the ambiguous term Pelite. Size ranges in millimeter (or micrometer) and Inches. LT 256 mm LT 10.1 in  "boulder";64-256 mm 2.5-10.1 in "cobble"; 32-64 mm 1.26-2.5 in "very coarse gravel"; 16-32 mm 0.63-1.26 in "coarse gravel"; 8-16 mm 0.31-0.63 in "medium gravel"; 4-8 mm 0.157-0.31 in "fine gravel";2-4 mm 0.079-0.157 in "very fine gravel"; 1-2 mm 0.039-0.079 in "very coarse sand"; 0.5-1 mm 0.020-0.039 in "coarse sand"; 0.25-0.5 mm 0.010-0.020 in "medium sand"; 125-250 um 0.0049-0.010 in "fine sand"; 62.5-125 um 0.0025-0.0049 in "very fine sand"; 3.90625-62.5 um 0.00015-0.0025 in "silt"; LT 3.90625 um LT 0.00015 in "clay"; LT 1 um LT 0.000039 in  "colloid"'
      },
      {
        name: "roundness",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology roundness description from Shell 4.3.1.3 Roundness (roundness refers to modal size class).very angular, angular, subangular, subrounded, rounded, well rounded."
      },
      {
        name: "sphericity",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology sphericity description for the modal size class of grains in the sample, defined as per Shell 4.3.1.4 Sphericity.very elongated, elongated, slightly elongated, slightly spherical, spherical, very spherical"
      },
      {
        name: "sorting",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology sorting descriptione from Shell 4.3.1.2 Sorting.very poorly sorted, unsorted, poorly sorted, poorly to moderately well sorted, moderately well sorted, well sorted, very well sorted, unimodally sorted, bimodally sorted."
      },
      {
        name: "matrixCement",
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology matrix/cement description. Terms will be as defined in the enumeration table.eg. "calcite" (Common) "dolomite", "ankerite" (eg. North Sea HPHT reservoirs such as Elgin and Franklin have almost pure Ankerite cementation,"siderite" (Sherwood sandstones, southern UK typical Siderite cements), "quartz" (grain to grain contact cementation or secondary quartz deposition),"kaolinite", "illite" (eg. Village Fields North Sea), "smectite","chlorite" (Teg, Algeria.)'
      },
      {
        name: "porosityVisible",
        documentation:
          'STRUCTURED DESCRIPTION USAGE. Lithology visible porosity description.Defined after BakerHughes definitions, as opposed to Shell, which has no linkage to actual numeric estimates.The theoretical maximum porosity for a clastic rock is about 26%. This is normally much reduced by other factors.When estimating porosities use: MT 15% "good" 10 to 15% "fair" 5 to 10% "poor" LT 5% "trace" 0 "none"'
      },
      {
        name: "porosityFabric",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Visible porosity fabric description from after Shell 4.3.2.1 and 4.3.2.2.intergranular (particle size greater than 20m), fine interparticle (particle size less than 20m), intercrystalline, intragranular, intraskeletal,intracrystalline, mouldic, fenestral, shelter, framework, stylolitic, replacement, solution, vuggy, channel, cavernous."
      },
      {
        name: "permeability",
        documentation:
          "STRUCTURED DESCRIPTION USAGE. Lithology permeability description from Shell 4.3.2.5.In future these would benefit from quantification. tight, slightly, fairly, highly."
      },
      {
        name: "densShale",
        documentation:
          "DEPRECATED. This entry for shale density should not be used. Shale densities should be entered in the Shale Density in cs_geologyInterval.",
        properties: dataGridUomProperties
      },
      {
        name: "qualifier",
        documentation:
          'A single qualifier from the Qualifier enum table for graphical representation in the Lithology columns.In mudlogging terms, a qualifier is a graphical symbol in the Interpreted Lithology column of the Formation Evaluation Log (aka "the mudlog").In addition to the major lithologies (e.g., sand, shale, etc) existing in the sample,other minerals (present as accessories or inclusions e.g. chert, pyrite, glauconite) and fossils (forams, oyster shells, bryozoans, etc.) may existand their abundance is generally categorized using ranges such as Trace.These additional minerals and fossils can be of disproportionately great diagnostic and descriptive value.For example,qualifiers can be used to indicate facies changes, marker beds or something that impacted drilling conditions.These qualifiers (representing accessories, inclusions and/or fossils) are used to rapidly and graphically indicate to the recipient of the mudlogthat a significant lithological event was encountered while drilling the well.The qualifier can also be used in creating the structured descriptions.',
        isContainer: true,
        isMultiple: true,
        properties: [
          {
            name: "uid",
            documentation: "",
            isAttribute: true
          },
          {
            name: "type",
            documentation: "The type of qualifier."
          },
          {
            name: "mdTop",
            documentation:
              "The measured depth at the top of the interval represented by the qualifier. This must be within the range of the parent geologic interval. If mdTop and mdBottom are not given then the qualifier is deemed to exist over the depth range of the parent geologyInterval.",
            properties: dataGridMeasuredDepthCoordProperties
          },
          {
            name: "mdBottom",
            documentation:
              "The measured depth at the bottom of the interval represented by the qualifier. A point can be indicated by specifying bottom=top. This must be within the range of the parent geologic interval.",
            properties: dataGridMeasuredDepthCoordProperties
          },
          {
            name: "abundance",
            documentation:
              'The relative abundance of the qualifier estimated based on a "visual area" basis by inspecting the cuttings spread out on the shaker table prior to washing, or in the sample tray after washing. This represents the upper bound of the observed range, and is in the following increments at the upper bound. 1 = less than or equal to 1%, 2 = greater than or equal to 1 and less than 2%, 5 = greater than or equal to 2 and less than 5% and then in 5% increments, 10 (=5-10%), 15 (=10-15%) up to 100(=95-100%). The end user can then elect to either display the %, or map then to an operator specific term or coding, i.e. 1 less then or equal to 1%=Rare Trace, or occasional, or very sparse etc., depending on the the end users\' terminology.) ',
            properties: dataGridUomProperties
          },
          {
            name: "abundanceCode",
            documentation:
              "DEPRECATED. This prior useage for a specific terminology is suggested to no longer be used, as the intent should be to avoid encoding proprietary terms. But, for the sake of interoperability, proprietary descriptive use of a specific term for a percentage, should be derived from the abundance % by the end users' visualization application, using the end users' terminology. (i.e. if 1 less than or equal to 1% = Rare Trace or equivalent terminology for the specific operator; this can be mapped in the end user application, but is redundant to be encoded in the standard.)"
          },
          {
            name: "description",
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
    documentation: "Show record through the Interval.",
    isContainer: true,
    properties: [
      {
        name: "showRat",
        documentation: "Show Rating."
      },
      {
        name: "stainColor",
        documentation: "Visible Stain Color."
      },
      {
        name: "stainDistr",
        documentation: "Visible Stain Distribution."
      },
      {
        name: "stainPc",
        documentation: "Visible Stain (commonly in percent).",
        properties: dataGridUomProperties
      },
      {
        name: "natFlorColor",
        documentation: "Natural Fluorescence Color."
      },
      {
        name: "natFlorPc",
        documentation: "Natural fluorescence (commonly in percent).",
        properties: dataGridUomProperties
      },
      {
        name: "natFlorLevel",
        documentation: "Natural fluorescence level."
      },
      {
        name: "natFlorDesc",
        documentation: "Natural fluorescence description."
      },
      {
        name: "cutColor",
        documentation: "Cut color."
      },
      {
        name: "cutSpeed",
        documentation: "Cut speed."
      },
      {
        name: "cutStrength",
        documentation: "Cut strength."
      },
      {
        name: "cutForm",
        documentation: "Cut formulation."
      },
      {
        name: "cutLevel",
        documentation: "Cut level (Faint, Bright, etc.)."
      },
      {
        name: "cutFlorColor",
        documentation: "Cut fluorescence color."
      },
      {
        name: "cutFlorSpeed",
        documentation: "Cut fluorescence speed."
      },
      {
        name: "cutFlorStrength",
        documentation: "Cut fluorescence strength."
      },
      {
        name: "cutFlorForm",
        documentation: "Cut fluorescence form."
      },
      {
        name: "cutFlorLevel",
        documentation: "Cut fluorescence level."
      },
      {
        name: "residueColor",
        documentation: "Residue color."
      },
      {
        name: "showDesc",
        documentation: "Free format show description."
      },
      {
        name: "impregnatedLitho",
        documentation: "Impregnated lithology."
      },
      {
        name: "odor",
        documentation: "Description of any hydrocarbon type odors smelled."
      }
    ]
  },
  {
    name: "chromatograph",
    documentation: "Chromatographic break down for the interval.",
    isContainer: true,
    properties: [
      {
        name: "dTim",
        documentation:
          "The date and time at which the gas sample was processed."
      },
      {
        name: "mdTop",
        documentation: "Measured depth at top of Interval.",
        properties: dataGridMeasuredDepthCoordProperties
      },
      {
        name: "mdBottom",
        documentation: "Measured depth at base of interval.",
        properties: dataGridMeasuredDepthCoordProperties
      },
      {
        name: "wtMudIn",
        documentation: "Mud density in (active pits).",
        properties: dataGridUomProperties
      },
      {
        name: "wtMudOut",
        documentation: "Mud density out (flowline).",
        properties: dataGridUomProperties
      },
      {
        name: "chromType",
        documentation: "Chromatograph type."
      },
      {
        name: "eTimChromCycle",
        documentation: "Chromatograph cycle time. Commonly in seconds.",
        properties: dataGridUomProperties
      },
      {
        name: "chromIntRpt",
        documentation:
          "Chromatograph integrator report time, format may be variable due to recording equipment "
      },
      {
        name: "methAv",
        documentation: "Methane (C1) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "methMn",
        documentation: "Methane (C1) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "methMx",
        documentation: "Methane (C1) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "ethAv",
        documentation: "Ethane (C2) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "ethMn",
        documentation: "Ethane (C2) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "ethMx",
        documentation: "Ethane (C2) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "propAv",
        documentation: "Propane (C3) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "propMn",
        documentation: "Propane (C3) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "propMx",
        documentation: "Propane (C3) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "ibutAv",
        documentation: "iso-Butane (iC4) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "ibutMn",
        documentation: "iso-Butane (iC4) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "ibutMx",
        documentation: "iso-Butane (iC4) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "nbutAv",
        documentation: "nor-Butane (nC4) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "nbutMn",
        documentation: "nor-Butane (nC4) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "nbutMx",
        documentation: "nor-Butane (nC4) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "ipentAv",
        documentation: "iso-Pentane (iC5) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "ipentMn",
        documentation: "iso-Pentane (iC5) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "ipentMx",
        documentation: "iso-Pentane (iC5) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "npentAv",
        documentation: "nor-Pentane (nC5) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "npentMn",
        documentation: "nor-Pentane (nC5) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "npentMx",
        documentation: "nor-Pentane (nC5) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "epentAv",
        documentation: "neo-Pentane (eC5) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "epentMn",
        documentation: "neo-Pentane (eC5) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "epentMx",
        documentation: "neo-Pentane (eC5) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "ihexAv",
        documentation: "iso-Hexane (iC6) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "ihexMn",
        documentation: "iso-Hexane (iC6) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "ihexMx",
        documentation: "iso-Hexane (iC6) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "nhexAv",
        documentation: "nor-Hexane (nC6) ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "nhexMn",
        documentation: "nor-Hexane (nC6) ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "nhexMx",
        documentation: "nor-Hexane (nC6) ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "co2Av",
        documentation: "Carbon Dioxide ppm (average).",
        properties: dataGridUomProperties
      },
      {
        name: "co2Mn",
        documentation: "Carbon Dioxide ppm (minimum).",
        properties: dataGridUomProperties
      },
      {
        name: "co2Mx",
        documentation: "Carbon Dioxide ppm (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "h2sAv",
        documentation: "Hydrogen Sulfide (average) ppm.",
        properties: dataGridUomProperties
      },
      {
        name: "h2sMn",
        documentation: "Hydrogen Sulfide (minimum) ppm.",
        properties: dataGridUomProperties
      },
      {
        name: "h2sMx",
        documentation: "Hydrogen Sulfide (maximum) ppm.",
        properties: dataGridUomProperties
      },
      {
        name: "acetylene",
        documentation: "Acetylene.",
        properties: dataGridUomProperties
      }
    ]
  },
  {
    name: "mudGas",
    documentation: "Total gas readings associated with this interval.",
    isContainer: true,
    properties: [
      {
        name: "gasAv",
        documentation: "Average total gas.",
        properties: dataGridUomProperties
      },
      {
        name: "gasPeak",
        documentation: "Peak gas reading.",
        properties: dataGridUomProperties
      },
      {
        name: "gasPeakType",
        documentation: "Type of gas peak."
      },
      {
        name: "gasBackgnd",
        documentation: "Background gas reading.",
        properties: dataGridUomProperties
      },
      {
        name: "gasConAv",
        documentation: "Connection gas (average).",
        properties: dataGridUomProperties
      },
      {
        name: "gasConMx",
        documentation: "Connection gas (maximum).",
        properties: dataGridUomProperties
      },
      {
        name: "gasTrip",
        documentation: "Trip gas last reading.",
        properties: dataGridUomProperties
      }
    ]
  },
  {
    name: "densBulk",
    documentation: "Sample bulk density for the interval.",
    properties: dataGridUomProperties
  },
  {
    name: "densShale",
    documentation: "Shale density for the interval.",
    properties: dataGridUomProperties
  },
  {
    name: "calcite",
    documentation: "Calcimetry calcite percentage.",
    properties: dataGridUomProperties
  },
  {
    name: "dolomite",
    documentation: "Calcimetry dolomite percentage.",
    properties: dataGridUomProperties
  },
  {
    name: "cec",
    documentation: "Cuttings cationic exchange capacity.",
    properties: dataGridUomProperties
  },
  {
    name: "qft",
    documentation:
      "Fluorescence as measured using a device licensed for the Quantitative Fluorescence Technique.",
    properties: dataGridUomProperties
  },
  {
    name: "calcStab",
    documentation: "Calcimetry stabilized percentage.",
    properties: dataGridUomProperties
  },
  {
    name: "nameFormation",
    documentation:
      "DEPRECATED. Formerly defined as name of formation penetrated, now deprecated to be replaced by lithostratigraphic with kind=formation.",
    isMultiple: true
  },
  {
    name: "lithostratigraphic",
    documentation: "Name of lithostratigraphy, regionally dependent.",
    isMultiple: true,
    properties: dataGridLithostratigraphyStructProperties
  },
  {
    name: "chronostratigraphic",
    documentation: "Chronostratigraphic classification.",
    isMultiple: true,
    properties: dataGridChronostratigraphyStructProperties
  },
  {
    name: "sizeMn",
    documentation: "Minimum size.",
    properties: dataGridUomProperties
  },
  {
    name: "sizeMx",
    documentation: "Maximum size.",
    properties: dataGridUomProperties
  },
  {
    name: "lenPlug",
    documentation: "Plug length.",
    properties: dataGridUomProperties
  },
  {
    name: "description",
    documentation: "Description of item and details."
  },
  {
    name: "cuttingFluid",
    documentation: "Sample treatment : cutting fluid."
  },
  {
    name: "cleaningMethod",
    documentation: "Sample treatment : cleaning method."
  },
  {
    name: "dryingMethod",
    documentation: "Sample treatment : drying method."
  },
  {
    name: "comments",
    documentation: "Comments and remarks."
  },
  {
    name: "commonTime",
    documentation:
      "A container element for creation and last-change DateTime information."
  },
  dataGridExtensionNameValue
];
