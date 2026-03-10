import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

export const dataGridAssetContactProperties: DataGridProperty[] = [
  {
    name: "uid",
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the asset contact.",
    isAttribute: true
  },
  {
    name: "companyName",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Company name."
  },
  {
    name: "name",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Contact name."
  },
  {
    name: "role",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Contact's role."
  },
  {
    name: "emailAddress",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Contact email address."
  },
  {
    name: "phoneNum",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Asset contact telephone number."
  },
  {
    name: "availability",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Contact's availability."
  },
  {
    name: "timeZone",
    required: false,
    baseType: "string",
    witsmlType: "timeZone",
    maxLength: 6,
    documentation:
      "The time zone in which the contact is located. It is the deviation in hours and minutes from UTC. This should be the normal time zone at the well and not a seasonally adjusted value such as daylight savings time."
  },
  dataGridExtensionNameValue
];
