import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";

export const dataGridExtensionNameValue: DataGridProperty = {
  name: "extensionNameValue",
  required: false,
  witsmlType: "cs_extensionNameValue",
  documentation: "Extensions to the schema based on a name-value construct.",
  isContainer: true,
  isMultiple: true,
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
      name: "name",
      required: true,
      baseType: "string",
      witsmlType: "extensionName",
      maxLength: 50,
      documentation:
        "The name of the extension. Each standard name should document the expected measure class. Each standard name should document the expected maximum size. For numeric values the size should be in terms of xsd types such as int, long, short, byte, float or double. For strings, the maximum length should be defined in number of characters. Local extensions to the list of standard names are allowed but it is strongly recommended that the names and definitions be approved by the WITSML SIG Technical Team before use."
    },
    {
      name: "value",
      required: true,
      baseType: "string",
      witsmlType: "extensionValue",
      maxLength: 4000,
      documentation:
        "The value of the extension. This may also include a uom attribute. The content should conform to constraints defined by the data type.",
      properties: [
        {
          name: "uom",
          required: false,
          baseType: "string",
          witsmlType: "uomString",
          maxLength: 24,
          documentation:
            "The unit of measure for the value. This value must conform to the values allowed by a measure class.",
          isAttribute: true
        }
      ]
    },
    {
      name: "dataType",
      required: true,
      baseType: "string",
      witsmlType: "primitiveType",
      maxLength: 50,
      documentation: "The underlying XML type of the value."
    },
    {
      name: "dTim",
      required: false,
      baseType: "dateTime",
      witsmlType: "timestamp",
      documentation: "The date-time associated with the value."
    },
    {
      name: "md",
      required: false,
      baseType: "double",
      witsmlType: "measuredDepthCoord",
      documentation: "The measured depth associated with the value.",
      properties: dataGridMeasuredDepthCoordProperties
    },
    {
      name: "index",
      required: false,
      baseType: "int",
      witsmlType: "positiveCount",
      documentation:
        "Indexes things with the same name. That is, 1 indicates the first one, 2 incidates the second one, etc."
    },
    {
      name: "measureClass",
      required: false,
      baseType: "string",
      witsmlType: "measureClass",
      maxLength: 50,
      documentation:
        'The kind of the measure. For example, "length". This should be specified if the value requires a unit of measure.'
    },
    {
      name: "description",
      required: false,
      baseType: "string",
      witsmlType: "descriptionString",
      maxLength: 256,
      documentation: "A textual description of the extension."
    }
  ]
};
