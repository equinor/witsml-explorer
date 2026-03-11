import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridIndexedObjectProperties } from "templates/dataGrid/objects/common/properties/DataGridIndexedObjectProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefObjectStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefObjectStringProperties";

export const dataGridMessage: DataGridProperty = {
  name: "messages",
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
      name: "message",
      documentation: "A single message.",
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
          documentation: "Unique identifier for the message.",
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
            "Human recognizable context for the wellbore that contains the message."
        },
        {
          name: "name",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation: "Human recognizable context for the message."
        },
        {
          name: "objectReference",
          required: false,
          baseType: "string",
          witsmlType: "refObjectString",
          maxLength: 64,
          documentation:
            "A reference to an object that is defined within the context of a wellbore.",
          properties: dataGridRefObjectStringProperties
        },
        {
          name: "subObjectReference",
          required: false,
          baseType: "string",
          witsmlType: "refObjectString",
          maxLength: 64,
          documentation:
            "A reference to an sub-object that is defined within the context of the object referenced by objectReference. This should only refer to recurring components of a growing object.",
          properties: dataGridRefObjectStringProperties
        },
        {
          name: "dTim",
          required: true,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation: "Date and time the information is related to."
        },
        {
          name: "activityCode",
          required: false,
          baseType: "string",
          witsmlType: "activityCode",
          maxLength: 50,
          documentation: "A code used to define rig activity."
        },
        {
          name: "detailActivity",
          required: false,
          baseType: "string",
          witsmlType: "str32",
          maxLength: 32,
          documentation: "Custom string to further define an activity."
        },
        {
          name: "md",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "Along hole measured depth of measurement from the drill datum.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdBit",
          required: false,
          baseType: "double",
          witsmlType: "measuredDepthCoord",
          documentation:
            "Along hole measured depth of measurement from the drill datum.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "typeMessage",
          required: true,
          baseType: "string",
          witsmlType: "messageType",
          maxLength: 50,
          documentation: "Message type."
        },
        {
          name: "messageText",
          required: false,
          baseType: "string",
          witsmlType: "commentString",
          maxLength: 4000,
          documentation: "Message text. "
        },
        {
          name: "param",
          required: false,
          baseType: "string",
          witsmlType: "indexedObject",
          maxLength: 50,
          documentation:
            "Any extra numeric data. For this usage the name attribute MUST be specified because it represents the meaning of the data. While the index attribute is mandatory, it is only significant if the same name repeats.",
          isMultiple: true,
          properties: dataGridIndexedObjectProperties
        },
        {
          name: "severity",
          required: false,
          baseType: "string",
          witsmlType: "messageSeverity",
          maxLength: 50,
          documentation: "Severity of incident."
        },
        {
          name: "warnProbability",
          required: false,
          baseType: "string",
          witsmlType: "messageProbability",
          maxLength: 50,
          documentation: "A warning probability (applies to warning)."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
