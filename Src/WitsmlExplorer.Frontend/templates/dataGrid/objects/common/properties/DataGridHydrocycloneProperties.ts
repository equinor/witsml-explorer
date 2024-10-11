import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridNameTagProperties } from "templates/dataGrid/objects/common/properties/DataGridNameTagProperties";

export const dataGridHydrocycloneProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the hydrocyclone.",
    isAttribute: true
  },
  {
    name: "manufacturer",
    documentation: "Manufacturer / supplier of the item.  "
  },
  {
    name: "model",
    documentation: "Manufacturers designated model.  "
  },
  {
    name: "dTimInstall",
    documentation: "Date and time of installation.  "
  },
  {
    name: "dTimRemove",
    documentation: "Removal date and time.  "
  },
  {
    name: "type",
    documentation: "Description for the type of object.  "
  },
  {
    name: "descCone",
    documentation: "Cones description.  "
  },
  {
    name: "owner",
    documentation: "Contractor/owner.  "
  },
  {
    name: "nameTag",
    documentation:
      "An identification tag for the hydrocyclone. A serial number is a type of identification tag however some tags contain many pieces of information. This structure just identifies the tag and does not describe the contents.",
    isContainer: true,
    isMultiple: true,
    properties: dataGridNameTagProperties
  },
  dataGridExtensionNameValue
];
