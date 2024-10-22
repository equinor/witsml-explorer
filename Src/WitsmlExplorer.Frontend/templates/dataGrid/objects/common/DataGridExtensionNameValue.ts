import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridExtensionNameValue: DataGridProperty = {
  name: "extensionNameValue",
  documentation: "Extensions to the schema based on a name-value construct.",
  isContainer: true,
  isMultiple: true,
  properties: [
    {
      name: "uid",
      documentation: "Unique identifier for the node.",
      isAttribute: true
    },
    {
      name: "name",
      documentation:
        "The name of the extension. Each standard name should document the expected measure class. Each standard name should document the expected maximum size. For numeric values the size should be in terms of xsd types such as int, long, short, byte, float or double. For strings, the maximum length should be defined in number of characters. Local extensions to the list of standard names are allowed but it is strongly recommended that the names and definitions be approved by the WITSML SIG Technical Team before use."
    },
    {
      name: "value",
      documentation:
        "The value of the extension. This may also include a uom attribute. The content should conform to constraints defined by the data type.",
      properties: [
        {
          name: "uom",
          documentation:
            "The unit of measure for the value. This value must conform to the values allowed by a measure class.",
          isAttribute: true
        }
      ]
    },
    {
      name: "dataType",
      documentation: "The underlying XML type of the value."
    },
    {
      name: "dTim",
      documentation: "The date-time associated with the value."
    },
    {
      name: "md",
      documentation: "The measured depth associated with the value.",
      properties: [
        {
          name: "uom",
          documentation: "The unit of measure of the quantity value.",
          isAttribute: true
        },
        {
          name: "datum",
          documentation:
            "A pointer to the reference datum for this coordinate value as defined in WellDatum. This value is assumed to match the uid value in a WellDatum. If not given then the default WellDatum must be assumed.",
          isAttribute: true
        }
      ]
    },
    {
      name: "index",
      documentation:
        "Indexes things with the same name. That is, 1 indicates the first one, 2 incidates the second one, etc."
    },
    {
      name: "measureClass",
      documentation:
        'The kind of the measure. For example, "length". This should be specified if the value requires a unit of measure.'
    },
    {
      name: "description",
      documentation: "A textual description of the extension."
    }
  ]
};
