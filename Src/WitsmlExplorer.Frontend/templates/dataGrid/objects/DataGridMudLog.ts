import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCommonTime } from "templates/dataGrid/objects/common/DataGridCommonTime";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridGeologyIntervalProperties } from "templates/dataGrid/objects/common/properties/DataGridGeologyIntervalProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridMudLog: DataGridProperty = {
  name: "mudLogs",
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
      name: "mudLog",
      documentation: "A single mud log.",
      isMultiple: true,
      isContainer: true,
      properties: [
        {
          name: "uidWell",
          required: false,
          baseType: "string",
          witsmlType: "uidParentString",
          maxLength: 64,
          documentation:
            "Unique identifier for the well. This uniquely represents the well referenced by the (possibly non-unique) nameWell.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          required: false,
          baseType: "string",
          witsmlType: "uidParentString",
          maxLength: 64,
          documentation:
            "Unique identifier for the wellbore. This uniquely represents the wellbore referenced by the (possibly non-unique) nameWellbore.",
          isAttribute: true
        },
        {
          name: "uid",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation: "Unique identifier for the mud log.",
          isAttribute: true
        },
        {
          name: "nameWell",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable context for the well that contains the wellbore."
        },
        {
          name: "nameWellbore",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable context for the wellbore that contains the mud log."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the mud log."
        },
        {
          name: "objectGrowing",
          required: false,
          baseType: "boolean",
          witsmlType: "logicalBoolean",
          documentation:
            "The growing state of the object. This value is only relevant within the context of a server."
        },
        {
          name: "dTim",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time the information is related to."
        },
        {
          name: "mudLogCompany",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Name of the company recording the information."
        },
        {
          name: "mudLogEngineers",
          required: false,
          baseType: "string",
          witsmlType: "descriptionString",
          maxLength: 256,
          documentation:
            "Concatenated names of mud loggers constructing the log."
        },
        {
          name: "startMd",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "The minimum mdTop value for this object. This is an API 'structural-range' query parameter for growing objects. See the relevant API specification for the query behavior related to this element.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "endMd",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "The maximum mdTop value for this object. This is an API 'structural-range' query parameter for growing objects. See the relevant API specification for the query behavior related to this element.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "relatedLog",
          required: false,
          baseType: "string",
          witsmlType: "refNameString",
          maxLength: 64,
          documentation:
            "A foreign key to a related Log. This is a pointer to a log that is related to the mud log. The log may or may not have been created as a result of the mudlogging process. The log must represent the same well and wellbore as the mud log.",
          isMultiple: true,
          properties: dataGridRefNameStringProperties
        },
        {
          name: "parameter",
          required: false,
          witsmlType: "cs_mudLogParameter",
          documentation: "A single mud log parameter.",
          isMultiple: true,
          isContainer: true,
          properties: [
            {
              name: "uid",
              required: false,
              baseType: "string",
              witsmlType: "uidString",
              maxLength: 64,
              documentation: "Unique identifier for the mud parameter.",
              isAttribute: true
            },
            {
              name: "type",
              required: true,
              baseType: "string",
              witsmlType: "mudLogParameterType",
              maxLength: 50,
              documentation: "The type of the mud log parameter."
            },
            {
              name: "dTime",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation:
                "The data and time related to the parameter.The time refers to the top of the interval. "
            },
            {
              name: "mdTop",
              required: true,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation:
                "The measured depth at a point or at the top of an interval. ",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "mdBottom",
              required: true,
              baseType: "double",
              witsmlType: "measuredDepthCoord",
              documentation:
                "The bottom of an interval along the borehole.A point interval should be indicated by setting mdTop=mdBottom.",
              properties: dataGridMeasuredDepthCoordProperties
            },
            {
              name: "force",
              required: false,
              baseType: "double",
              witsmlType: "forceMeasure",
              documentation:
                "A force value (e.g., hookload) that represents the parameter.",
              properties: dataGridUomProperties("forceUom")
            },
            {
              name: "concentration",
              required: false,
              baseType: "double",
              witsmlType: "volumePerVolumeMeasure",
              documentation:
                "A concentration value that represents the parameter.",
              properties: dataGridUomProperties("volumePerVolumeUom")
            },
            {
              name: "equivalentMudWeight",
              required: false,
              baseType: "double",
              witsmlType: "densityMeasure",
              documentation:
                "A equivalent mud weight value that represents the parameter. This commonly used for pressure gradient parameters and pressure parameters.",
              properties: dataGridUomProperties("densityUom")
            },
            {
              name: "pressureGradient",
              required: false,
              baseType: "double",
              witsmlType: "forcePerVolumeMeasure",
              documentation:
                "A pressure gradient value that represents the parameter.\tThis is sometimes specified instead of an equivalent mud weight.",
              properties: dataGridUomProperties("forcePerVolumeUom")
            },
            {
              name: "text",
              required: false,
              baseType: "string",
              witsmlType: "uncollapsedString",
              maxLength: 256,
              documentation:
                "A textual parameter value. This value is typically annotation on the log.All spaces, tabs, line feeds and carriage returns are retained in the string. Characters representing line breaks should be replaced by a line feed or carriage return."
            },
            dataGridCommonTime,
            dataGridExtensionNameValue
          ]
        },
        {
          name: "geologyInterval",
          required: false,
          witsmlType: "cs_geologyInterval",
          documentation:
            "Set of geology and drilling information records for the wellbore. This is an API 'data-node' query parameter for growing objects.",
          isContainer: true,
          isMultiple: true,
          properties: dataGridGeologyIntervalProperties
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
