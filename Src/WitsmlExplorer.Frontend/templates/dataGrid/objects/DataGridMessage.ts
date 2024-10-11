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
          documentation:
            "Unique identifier for the well. This uniquely represents the well referenced by the (possibly non-unique) nameWell.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          documentation:
            "Unique identifier for the wellbore. This uniquely represents the wellbore referenced by the (possibly non-unique) nameWellbore.",
          isAttribute: true
        },
        {
          name: "uid",
          documentation: "Unique identifier for the message.",
          isAttribute: true
        },
        {
          name: "nameWell",
          documentation:
            "Human recognizable context for the well that contains the wellbore."
        },
        {
          name: "nameWellbore",
          documentation:
            "Human recognizable context for the wellbore that contains the message."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the message."
        },
        {
          name: "objectReference",
          documentation:
            "A reference to an object that is defined within the context of a wellbore.",
          properties: dataGridRefObjectStringProperties
        },
        {
          name: "subObjectReference",
          documentation:
            "A reference to an sub-object that is defined within the context of the object referenced by objectReference. This should only refer to recurring components of a growing object.",
          properties: dataGridRefObjectStringProperties
        },
        {
          name: "dTim",
          documentation: "Date and time the information is related to."
        },
        {
          name: "activityCode",
          documentation: "A code used to define rig activity."
        },
        {
          name: "detailActivity",
          documentation: "Custom string to further define an activity."
        },
        {
          name: "md",
          documentation:
            "Along hole measured depth of measurement from the drill datum.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdBit",
          documentation:
            "Along hole measured depth of measurement from the drill datum.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "typeMessage",
          documentation: "Message type."
        },
        {
          name: "messageText",
          documentation: "Message text. "
        },
        {
          name: "param",
          documentation:
            "Any extra numeric data. For this usage the name attribute MUST be specified because it represents the meaning of the data. While the index attribute is mandatory, it is only significant if the same name repeats.",
          isMultiple: true,
          properties: dataGridIndexedObjectProperties
        },
        {
          name: "severity",
          documentation: "Severity of incident."
        },
        {
          name: "warnProbability",
          documentation: "A warning probability (applies to warning)."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
