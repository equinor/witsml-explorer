import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

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
          documentation:
            "Unique identifier for the well. This should match the value of the uidWell attribute in the changed object. If the changed object is well then this value will not be defined. This is required for objects which are a direct or indirect child of a well.",
          isAttribute: true
        },
        {
          name: "uidWellbore",
          documentation:
            "Unique identifier for the wellbore. This should match the value of the uidWellbore attribute in the changed object. If the changed object is well or wellbore then this value will not be defined. This is required for objects which are a direct or indirect child of a well or wellbore.",
          isAttribute: true
        },
        {
          name: "uidObject",
          documentation:
            "Unique identifier for the changed object. This should match the value of the uid attribute in the changed object.",
          isAttribute: true
        },
        {
          name: "nameWell",
          documentation:
            "Human recognizable contextual name for a Well. This should match the value of element nameWell in the changed object. If the changed object is well then this value will not be defined. This is required for objects which are a direct or indirect child of a well."
        },
        {
          name: "nameWellbore",
          documentation:
            "Human recognizable contextual name for the Wellbore. This should match the value of element nameWellbore in the changed object. If the changed object is well or wellbore then this value will not be defined. This is required for objects which are a direct or indirect child of a wellbore."
        },
        {
          name: "nameObject",
          documentation:
            "Human recognizable contextual name for the object. This should match the value of the name element in the changed object."
        },
        {
          name: "objectType",
          documentation:
            'The schema name of the (singular) object that changed. For example, "trajectory".'
        },
        {
          name: "sourceName",
          documentation:
            "See the API specification for a description of the use of this data."
        },
        {
          name: "lastChangeType",
          documentation:
            "See the API specification for a description of the use of this data."
        },
        {
          name: "lastChangeInfo",
          documentation:
            "See the API specification for a description of the use of this data."
        },
        {
          name: "changeHistory",
          documentation:
            "See the API specification for a description of the use of this data.",
          isMultiple: true,
          isContainer: true,
          properties: [
            {
              name: "uid",
              documentation: "Unique identifier for the node.",
              isAttribute: true
            },
            {
              name: "dTimChange",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "changeType",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "objectGrowingState",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "updatedHeader",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "changeInfo",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "startIndex",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "endIndex",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "startDateTimeIndex",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "endDateTimeIndex",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "mnemonics",
              documentation:
                "See the API specification for a description of the use of this data."
            },
            {
              name: "extensionNameValue",
              documentation:
                "See the API specification for a description of the use of this data.",
              properties: [dataGridExtensionNameValue]
            }
          ]
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
