import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionAny } from "templates/dataGrid/objects/common/DataGridExtensionAny";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";

export const dataGridCommonData: DataGridProperty = {
  name: "commonData",
  required: false,
  witsmlType: "cs_commonData",
  documentation:
    "A container element that contains elements that are common to all data objects.",
  isContainer: true,
  properties: [
    {
      name: "sourceName",
      required: false,
      baseType: "string",
      witsmlType: "nameString",
      maxLength: 64,
      documentation:
        "An identifier to indicate the data originator. This identifies the server that originally created the object and thus most of the uids in the object (but not necessarily the uids of the parents). This is typically a url."
    },
    {
      name: "dTimCreation",
      required: false,
      baseType: "dateTime",
      witsmlType: "timestamp",
      documentation:
        'When the data was created at the persistent data store. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the behavior related to this element.'
    },
    {
      name: "dTimLastChange",
      required: false,
      baseType: "dateTime",
      witsmlType: "timestamp",
      documentation:
        'Last change of any element of the data at the persistent data store. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the behavior related to this element.'
    },
    {
      name: "itemState",
      required: false,
      baseType: "string",
      witsmlType: "itemState",
      maxLength: 50,
      documentation: "The item state for the data object."
    },
    {
      name: "serviceCategory",
      required: false,
      baseType: "string",
      witsmlType: "kindString",
      maxLength: 50,
      documentation:
        'The category of the service related to the creation of the object. For example, "mud log service", "cement service", "LWD service", "rig service", "drilling service".'
    },
    {
      name: "comments",
      required: false,
      baseType: "string",
      witsmlType: "commentString",
      maxLength: 4000,
      documentation: "Comments and remarks."
    },
    {
      name: "acquisitionTimeZone",
      required: false,
      baseType: "string",
      witsmlType: "timestampedTimeZone",
      maxLength: 6,
      documentation:
        "The local time zone of the original acquisition date-time values. It is the deviation in hours and minutes from UTC. The first occurrence should be the actual local time zone at the start of acquisition and may represent a seasonally adjusted value such as daylight savings. The dTim attribute must be populated in the second and subsequent occurrences if the local time zone changes during acquisition. This knowledge is required because the original time zone in a dateTime value may be lost when software converts to a different time zone.",
      properties: [
        {
          name: "dTim",
          required: false,
          baseType: "dateTime",
          witsmlType: "timestamp",
          documentation:
            "The date and time when this local time zone became active. This value must be defined on the second and subsequent occurrences.",
          isAttribute: true
        }
      ]
    },
    {
      name: "defaultDatum",
      required: false,
      baseType: "string",
      witsmlType: "refNameString",
      maxLength: 64,
      documentation:
        "A pointer to the default wellDatum for measured depth coordinates, vertical depth coordinates and elevation coordinates in this object. Depth coordinates that do not specify a datum attribute shall be assumed to be measured relative to this default vertical datum. The referenced wellDatum must be defined within the well object associated with this object.",
      properties: dataGridRefNameStringProperties
    },
    {
      name: "privateGroupOnly",
      required: false,
      baseType: "boolean",
      witsmlType: "boolean",
      documentation:
        "This is an API query parameter. See the API specification for the behavior related to this element."
    },
    dataGridExtensionAny,
    dataGridExtensionNameValue
  ]
};
