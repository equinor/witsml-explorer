import { DataGridProperty } from "templates/dataGrid/DataGridProperty";

export const dataGridCommonTime: DataGridProperty = {
  name: "commonTime",
  required: false,
  witsmlType: "cs_commonTime",
  documentation:
    "A container element for creation and last-change DateTime information.",
  isContainer: true,
  properties: [
    {
      name: "dTimCreation",
      required: false,
      baseType: "dateTime",
      witsmlType: "timestamp",
      documentation:
        'When the data was created at the persistent data store. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the  behavior related to this element.'
    },
    {
      name: "dTimLastChange",
      required: false,
      baseType: "dateTime",
      witsmlType: "timestamp",
      documentation:
        'Last change of any element of the data at the persistent data store. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the  behavior related to this element.'
    }
  ]
};
