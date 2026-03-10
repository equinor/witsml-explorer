import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import {
  dataGridFootageEastWest,
  dataGridFootageNorthSouth
} from "templates/dataGrid/objects/common/properties/DataGridFootageDirection";
import { dataGridLocationProperties } from "templates/dataGrid/objects/common/properties/DataGridLocationProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellCRSProperties } from "templates/dataGrid/objects/common/properties/DataGridWellCRSProperties";
import { dataGridWellDatumProperties } from "templates/dataGrid/objects/common/properties/DataGridWellDatumProperties";
import { dataGridWellElevationCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellElevationCoordProperties";

export const dataGridWell: DataGridProperty = {
  name: "wells",
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
      name: "well",
      documentation:
        "Information about a single well. A well is a unique surface location from which wellbores are drilled into the Earth for the purpose of either (1) finding or producing underground resources; or (2) providing services related to the production of underground resources.",
      isMultiple: true,
      isContainer: true,
      properties: [
        {
          name: "uid",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation:
            "Unique identifier for the well. This may be a globally unique identifier. The uid attributes of all dependent objects (e.g., wellbore) are only required to be uniue within the context the containing well.",
          isAttribute: true
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the well."
        },
        {
          name: "nameLegal",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Legal name of the well."
        },
        {
          name: "numLicense",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "License number of the well."
        },
        {
          name: "numGovt",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Government assigned well number."
        },
        {
          name: "dTimLicense",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time license was issued."
        },
        {
          name: "field",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of the field in which the well is located."
        },
        {
          name: "country",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Country in which well is located."
        },
        {
          name: "state",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "State or province in which well is located."
        },
        {
          name: "county",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "County in which the well is located."
        },
        {
          name: "region",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Geo-political region."
        },
        {
          name: "district",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Geo-political district name."
        },
        {
          name: "block",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Block name in which well is located."
        },
        {
          name: "timeZone",
          required: true,
          baseType: "string",
          witsmlType: "timeZone",
          maxLength: 6,
          documentation:
            "The time zone in which well is located. It is the deviation in hours and minutes from UTC. This should be the normal time zone at the well and not a seasonally adjusted value such as daylight savings time."
        },
        {
          name: "operator",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Operator company name."
        },
        {
          name: "operatorDiv",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Division of operator company."
        },
        {
          name: "pcInterest",
          required: false,
          baseType: "double",
          witsmlType: "dimensionlessMeasure",
          documentation: "Interest for Operator. Commonly in percent.",
          properties: dataGridUomProperties("percentUom")
        },
        {
          name: "numAPI",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "American Petroleum Institute well number."
        },
        {
          name: "statusWell",
          required: false,
          baseType: "string",
          witsmlType: "wellStatus",
          maxLength: 50,
          documentation: "POSC Well status."
        },
        {
          name: "purposeWell",
          required: false,
          baseType: "string",
          witsmlType: "wellPurpose",
          maxLength: 50,
          documentation: "POSC well purpose."
        },
        {
          name: "fluidWell",
          required: false,
          baseType: "string",
          witsmlType: "wellFluid",
          maxLength: 50,
          documentation:
            "POSC well fluid. The type of fluid being produced from or injected into a well facility."
        },
        {
          name: "directionWell",
          required: false,
          baseType: "string",
          witsmlType: "wellDirection",
          maxLength: 50,
          documentation:
            "POSC well direction. The direction of flow of the fluids in a well facility (generally, injected or produced, or some combination)."
        },
        {
          name: "dTimSpud",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time at which well was spudded."
        },
        {
          name: "dTimPa",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "Date and time at which well was plugged and abandoned."
        },
        {
          name: "wellheadElevation",
          required: false,
          baseType: "double",
          witsmlType: "wellElevationCoord",
          documentation: "Elevation of wellhead relative to a wellDatum.",
          properties: dataGridWellElevationCoordProperties
        },
        {
          name: "wellDatum",
          required: false,
          witsmlType: "cs_wellDatum",
          documentation:
            "A vertical datum to which elevations and depths are referenced.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridWellDatumProperties
        },
        {
          name: "groundElevation",
          required: false,
          baseType: "double",
          witsmlType: "wellElevationCoord",
          documentation: "Elevation of ground level (land rigs).",
          properties: dataGridWellElevationCoordProperties
        },
        {
          name: "waterDepth",
          required: false,
          baseType: "double",
          witsmlType: "lengthMeasure",
          documentation: "Depth of water (not land rigs).",
          properties: dataGridUomProperties("lengthUom")
        },
        {
          name: "wellLocation",
          required: false,
          witsmlType: "cs_location",
          documentation:
            "the 2D coordinates of the well surface point in one coordinate reference system. This is where the well crosses ground level on land and crosses the platform offshore.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridLocationProperties
        },
        {
          name: "wellPublicLandSurveySystemLocation",
          required: false,
          witsmlType: "cs_publicLandSurveySystem",
          documentation:
            "Township, section, range, quarter, and footage calls for USA Public Land Survey System.",
          isContainer: true,
          properties: [
            {
              name: "principalMeridian",
              required: false,
              baseType: "string",
              witsmlType: "principalMeridian",
              maxLength: 50,
              documentation: "Principal meridian for this location."
            },
            {
              name: "range",
              required: false,
              baseType: "integer",
              witsmlType: "positiveCount",
              documentation: "Range number."
            },
            {
              name: "rangeDir",
              required: false,
              baseType: "string",
              witsmlType: "eastOrWest",
              maxLength: 50,
              documentation: "Range direction."
            },
            {
              name: "township",
              required: false,
              baseType: "integer",
              witsmlType: "positiveCount",
              documentation: "Township number."
            },
            {
              name: "townshipDir",
              required: false,
              baseType: "string",
              witsmlType: "northOrSouth",
              maxLength: 50,
              documentation: "Township direction."
            },
            {
              name: "section",
              required: false,
              baseType: "string",
              witsmlType: "sectionNumber",
              maxLength: 50,
              documentation: "Section number."
            },
            {
              name: "quarterSection",
              required: false,
              baseType: "string",
              witsmlType: "publicLandSurveySystemQuarterSection",
              maxLength: 12,
              documentation:
                "The location of the well within the section, with the primary component listed first. Spot location will be made some from combination of the following codes: NE, NW, SW, SE, N2, S2, E2, W2, C (center quarter), LTxx (where xx represents a two digit lot designation), TRzz (where zz represents a one or two character trac designation). Free format will allow for entries such as NESW (southwest quarter of northeast quarter), E2NESE (southeast quarter of northeast quarter of east half), CNE (northeast quarter of center quarter), etc."
            },
            {
              name: "quarterTownship",
              required: false,
              baseType: "string",
              witsmlType: "publicLandSurveySystemQuarterTownship",
              maxLength: 12,
              documentation: "Quarter township."
            },
            {
              name: "footageNS",
              required: false,
              baseType: "double",
              witsmlType: "footageNorthSouth",
              documentation:
                "Distance inside of the boundary line of the specified section. North specifies the distance from the north boundary line.",
              properties: dataGridFootageNorthSouth
            },
            {
              name: "footageEW",
              required: false,
              baseType: "double",
              witsmlType: "footageEastWest",
              documentation:
                "Distance inside of the boundary line of the specified section. East specifies the distance from the east boundary line.",
              properties: dataGridFootageEastWest
            }
          ]
        },
        {
          name: "referencePoint",
          required: false,
          witsmlType: "cs_referencePoint",
          documentation:
            "Defines a reference point within the context of the well.",
          isContainer: true,
          isMultiple: true,
          properties: [
            {
              name: "uid",
              required: false,
              baseType: "string",
              witsmlType: "uidString",
              maxLength: 64,
              documentation: "Unique identifier for the point.",
              isAttribute: true
            },
            {
              name: "name",
              required: true,
              baseType: "string",
              witsmlType: "nameString",
              maxLength: 64,
              documentation: "Human recognizable context for the point."
            },
            {
              name: "type",
              required: false,
              baseType: "string",
              witsmlType: "kindString",
              maxLength: 50,
              documentation:
                "The kind of point. For example, 'well reference point', 'platform reference point', 'sea surface', 'sea bottom'."
            },
            {
              name: "elevation",
              required: false,
              baseType: "double",
              witsmlType: "wellElevationCoord",
              documentation:
                "The gravity based elevation coordinate of this point as measured from a datum. Positive moving upward from the elevation datum.",
              properties: dataGridWellElevationCoordProperties
            },
            {
              name: "measuredDepth",
              required: false,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation:
                'The measured depth coordinate of this reference point. Positive moving toward the bottomhole from the measured depth datum. This should be given when the reference is "downhole", such as an ocean bottom template, or when the reference point is also used as a vertical well datum. The measured depth value can be used to determine if the reference point and a vertical well datum are at the same point.',
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "location",
              required: true,
              witsmlType: "cs_location",
              documentation:
                "Two dimensional coordinates that locate the point.",
              isContainer: true,
              isMultiple: true,
              properties: dataGridLocationProperties
            },
            {
              name: "description",
              required: false,
              baseType: "string",
              witsmlType: "commentString",
              maxLength: 4000,
              documentation: "A textual description of the point."
            },
            dataGridExtensionNameValue
          ]
        },
        {
          name: "wellCRS",
          required: false,
          witsmlType: "cs_wellCRS",
          documentation:
            "A coordinate reference system that was used within the context of this well.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridWellCRSProperties
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
