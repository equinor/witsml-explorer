import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridCustomData } from "templates/dataGrid/objects/common/DataGridCustomData";
import { dataGridIndexedObjectProperties } from "templates/dataGrid/objects/common/properties/DataGridIndexedObjectProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";

export const dataGridAttachment: DataGridProperty = {
  name: "attachments",
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
      name: "attachment",
      documentation: "A single attachment Object.",
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
          documentation: "Unique identifier for the object.",
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
            "Human recognizable context for the wellbore that contains the (sub) object that is represented by the attachment. If no wellbore is specified then the attachment represents the well. If a wellbore is specified but no other object is specified then the attachment represents the wellbore."
        },
        {
          name: "name",
          documentation: "Human recognizable context for the attachment."
        },
        {
          name: "objectReference",
          documentation:
            "A reference to an object that is defined within the context of the specified wellbore.",
          properties: [
            {
              name: "object",
              documentation:
                'The type of data-object being referenced (e.g., "well", "wellbore").',
              isAttribute: true
            },
            {
              name: "uidRef",
              documentation:
                "A reference to the unique identifier (uid attribute) in the object referenced by the name value. This attribute is required within the context of a WITSML server.",
              isAttribute: true
            }
          ]
        },
        {
          name: "subObjectReference",
          documentation:
            "A reference to an sub-object that is defined within the context of the object referenced by objectReference. This should only refer to recurring components of a growing object.",
          properties: [
            {
              name: "object",
              documentation:
                'The type of data-object being referenced (e.g., "well", "wellbore").',
              isAttribute: true
            },
            {
              name: "uidRef",
              documentation:
                "A reference to the unique identifier (uid attribute) in the object referenced by the name value. This attribute is required within the context of a WITSML server.",
              isAttribute: true
            }
          ]
        },
        {
          name: "md",
          documentation:
            "Along hole measured depth represented by the attachment.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "mdBit",
          documentation: "Along hole measured depth of the bit.",
          properties: dataGridMeasuredDepthCoordProperties
        },
        {
          name: "param",
          documentation:
            "Any extra numeric data. For this usage the name attribute MUST be specified because it represents the meaning of the data. While the index attribute is mandatory, it is only significant if the same name repeats.",
          isMultiple: true,
          properties: dataGridIndexedObjectProperties
        },
        {
          name: "fileName",
          documentation: "A file name associated with the attachment."
        },
        {
          name: "description",
          documentation: "A description of attachment."
        },
        {
          name: "fileType",
          documentation: "The file type."
        },
        {
          name: "content",
          documentation: "The actual attachment content."
        },
        dataGridCommonData,
        dataGridCustomData
      ]
    }
  ]
};
