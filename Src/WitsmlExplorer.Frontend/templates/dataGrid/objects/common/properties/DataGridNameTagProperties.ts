import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";

export const dataGridNameTagProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the tag.",
    isAttribute: true
  },
  {
    name: "name",
    documentation: "The physical identification string of the equipment tag."
  },
  {
    name: "numberingScheme",
    documentation:
      'The format or encoding specification of the equipment tag.  The tag may contain may different pieces of information and knowledge of that  information is inherent in the specification.  The "identification string" is a mandatory part of the information in a tag.'
  },
  {
    name: "technology",
    documentation:
      "Identifies the general type of identifier on an item.  If multiple identifiers exist on an item, a separate description set for each identifier should be created.   For example, a joint of casing may have a barcode label on it along with a painted-on code and an RFID tag attached or embedded into the coupling.  The barcode label may in turn be an RFID equipped label. This particular scenario would require populating five nameTags to fully describe and decode all the possible identifiers as follows: 'tagged' - RFID tag embedded in the coupling, 'label'  - Serial number printed on the label, 'tagged' - RFID tag embedded into the label, 'label'  - Barcode printed on the label, 'painted'- Mill number painted on the pipe body."
  },
  {
    name: "location",
    documentation:
      "An indicator of where the tag is attached to the item. This is used to assist the user in finding where an identifier is located on an item.  This optional field also helps to differentiate where an identifier is located when multiple identifiers exist on an item. Most downhole components have a box (female thread) and pin (male thread) end as well as a pipe body in between the ends. Where multiple identifiers are used on an item, it is convenient to have a reference as to which end, or somewhere in the middle, an identifier may be closer to. Some items may have an identifier on a non-standard location, such as on the arm of a hole opener.  'other', by exclusion, tells a user to look elsewhere than on the body or near the ends of an item.  Most non-downhole tools will use either 'body', 'other' or not specified as the location tends to lose value with smaller or non threaded items."
  },
  {
    name: "installationDate",
    documentation: "When the tag was installed in or on the item.  "
  },
  {
    name: "installationCompany",
    documentation: "The name of the company that installed the tag.  "
  },
  {
    name: "mountingCode",
    documentation:
      "Reference to a manufacturers or installers installation  description, code, or method.  "
  },
  {
    name: "comment",
    documentation: "A comment or remark about the tag."
  },
  dataGridExtensionNameValue
];
