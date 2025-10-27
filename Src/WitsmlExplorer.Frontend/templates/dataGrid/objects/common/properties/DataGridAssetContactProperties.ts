import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

export const dataGridAssetContactProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the asset contact.",
    isAttribute: true
  },
  {
    name: "companyName",
    documentation: "Company name."
  },
  {
    name: "name",
    documentation: "Contact name."
  },
  {
    name: "role",
    documentation: "Contact's role."
  },
  {
    name: "emailAddress",
    documentation: "Contact email address."
  },
  {
    name: "phoneNum",
    documentation: "Asset contact telephone number."
  },
  {
    name: "availability",
    documentation: "Contact's availability."
  },
  {
    name: "timeZone",
    documentation:
      "The time zone in which the contact is located. It is the deviation in hours and minutes from UTC. This should be the normal time zone at the well and not a seasonally adjusted value such as daylight savings time."
  },
  dataGridExtensionNameValue
];
