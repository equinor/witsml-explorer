import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionAny } from "templates/dataGrid/objects/common/DataGridExtensionAny";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

export const dataGridCommonData: DataGridProperty = {
  name: "commonData",
  documentation:
    "A container element that contains elements that are common to all data objects.",
  isContainer: true,
  properties: [
    {
      name: "sourceName",
      documentation:
        "An identifier to indicate the data originator. This identifies the server that originally created the object and thus most of the uids in the object (but not necessarily the uids of the parents). This is typically a url."
    },
    {
      name: "dTimCreation",
      documentation:
        'When the data was created at the persistent data store. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the behavior related to this element.'
    },
    {
      name: "dTimLastChange",
      documentation:
        'Last change of any element of the data at the persistent data store. This is an API server parameter releted to the "Special Handling of Change Information" within a server. See the relevant API specification for the behavior related to this element.'
    },
    {
      name: "itemState",
      documentation: "The item state for the data object."
    },
    {
      name: "serviceCategory",
      documentation:
        'The category of the service related to the creation of the object. For example, "mud log service", "cement service", "LWD service", "rig service", "drilling service".'
    },
    {
      name: "comments",
      documentation: "Comments and remarks."
    },
    {
      name: "acquisitionTimeZone",
      documentation:
        "The local time zone of the original acquisition date-time values. It is the deviation in hours and minutes from UTC. The first occurrence should be the actual local time zone at the start of acquisition and may represent a seasonally adjusted value such as daylight savings. The dTim attribute must be populated in the second and subsequent occurrences if the local time zone changes during acquisition. This knowledge is required because the original time zone in a dateTime value may be lost when software converts to a different time zone.",
      properties: [
        {
          name: "dTim",
          documentation:
            "The date and time when this local time zone became active. This value must be defined on the second and subsequent occurrences.",
          isAttribute: true
        }
      ]
    },
    {
      name: "defaultDatum",
      documentation:
        "A pointer to the default wellDatum for measured depth coordinates, vertical depth coordinates and elevation coordinates in this object. Depth coordinates that do not specify a datum attribute shall be assumed to be measured relative to this default vertical datum. The referenced wellDatum must be defined within the well object associated with this object.",
      properties: [
        {
          name: "uidRef",
          documentation:
            "A reference to the unique identifier (uid attribute) in the node referenced by the name value. This attribute is required within the context of a WITSML server.",
          isAttribute: true
        }
      ]
    },
    {
      name: "privateGroupOnly",
      documentation:
        "This is an API query parameter. See the API specification for the behavior related to this element."
    },
    dataGridExtensionAny,
    dataGridExtensionNameValue
  ]
};
