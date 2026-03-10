import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";

export const dataGridChangeLog: DataGridProperty = {
  name: "changeLogs",
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
      name: "changeLog",
      documentation: "Defines the singular change log data type.",
      isMultiple: true,
      isContainer: true,
      properties: [
        {
          name: "uidWell",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation:
            "Unique identifier for the well. This should match the value of the uidWell attribute in the changed object. If the changed object is well then this value will not be defined. This is required for objects which are a direct or indirect child of a well.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation:
            "Unique identifier for the wellbore. This should match the value of the uidWellbore attribute in the changed object. If the changed object is well or wellbore then this value will not be defined. This is required for objects which are a direct or indirect child of a well or wellbore.",
          isAttribute: true
        },
        {
          name: "uidObject",
          required: true,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation:
            "Unique identifier for the changed object. This should match the value of the uid attribute in the changed object.",
          isAttribute: true
        },
        {
          name: "uid",
          required: false,
          baseType: "string",
          witsmlType: "uidString",
          maxLength: 64,
          documentation: "Unique identifier for the changeLog object.",
          isAttribute: true
        },
        {
          name: "nameWell",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable contextual name for a Well. This should match the value of element nameWell in the changed object. If the changed object is well then this value will not be defined. This is required for objects which are a direct or indirect child of a well."
        },
        {
          name: "nameWellbore",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable contextual name for the Wellbore. This should match the value of element nameWellbore in the changed object. If the changed object is well or wellbore then this value will not be defined. This is required for objects which are a direct or indirect child of a wellbore."
        },
        {
          name: "nameObject",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "Human recognizable contextual name for the object. This should match the value of the name element in the changed object."
        },
        {
          name: "objectType",
          required: true,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            'The schema name of the (singular) object that changed. For example, "trajectory".'
        },
        {
          name: "sourceName",
          required: false,
          baseType: "string",
          witsmlType: "nameString",
          maxLength: 64,
          documentation:
            "See the API specification for a description of the use of this data."
        },
        {
          name: "lastChangeType",
          required: true,
          baseType: "string",
          witsmlType: "changeInfoType",
          maxLength: 50,
          documentation:
            "See the API specification for a description of the use of this data."
        },
        {
          name: "lastChangeInfo",
          required: false,
          baseType: "string",
          witsmlType: "commentString",
          maxLength: 4000,
          documentation:
            "See the API specification for a description of the use of this data."
        },
        {
          name: "changeHistory",
          required: false,
          witsmlType: "cs_changeHistory",
          documentation:
            "See the API specification for a description of the use of this data.",
          isMultiple: true,
          isContainer: true,
          properties: [
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
              name: "dTimChange",
              required: true,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "changeType",
              required: true,
              baseType: "string",
              witsmlType: "changeInfoType",
              maxLength: 50,
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "objectGrowingState",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "updatedHeader",
              required: false,
              baseType: "boolean",
              witsmlType: "logicalBoolean",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "changeInfo",
              required: false,
              baseType: "string",
              witsmlType: "commentString",
              maxLength: 4000,
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "startIndex",
              required: false,
              baseType: "double",
              witsmlType: "genericMeasure",
              properties: dataGridUomProperties(),
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "endIndex",
              required: false,
              baseType: "double",
              witsmlType: "genericMeasure",
              properties: dataGridUomProperties(),
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "startDateTimeIndex",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "endDateTimeIndex",
              required: false,
              baseType: "dateTime",
              witsmlType: "timestamp",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "mnemonics",
              required: false,
              baseType: "string",
              witsmlType: "commentString",
              maxLength: 4000,
              documentation:
                "See the API specification for a description of the use of this data."
            },
            dataGridExtensionNameValue
          ]
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
