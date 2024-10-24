import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridLocationProperties } from "templates/dataGrid/objects/common/properties/DataGridLocationProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridRefWellWellboreProperties } from "templates/dataGrid/objects/common/properties/DataGridRefWellWellboreProperties";
import { dataGridRefWellWellboreRigProperties } from "templates/dataGrid/objects/common/properties/DataGridRefWellWellboreRigProperties";
import { dataGridWellElevationCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellElevationCoordProperties";
import { dataGridWellKnownNameStructProperties } from "templates/dataGrid/objects/common/properties/DataGridWellKnownNameStructProperties";

export const dataGridWellDatumProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation:
      'The unique identifier of the node. All measured depth, vertical depth and elevation coordinates may point to this uid using attribute "datum". Alternatively, the commonData elements defaultMeasuredDatum, defaultVerticalDatum and defaultElevationDatum may point to this value. The best practice for the uid is to derive it from the name. For example, by changing spaces to underscores.',
    isAttribute: true
  },
  {
    name: "name",
    documentation:
      "The human understandable contextual name of the reference datum."
  },
  {
    name: "code",
    documentation:
      "The code value that represents the type of reference datum. This may represent a point on a device (e.g., kelly bushing) or it may represent a vertical reference datum (e.g., mean sea level)."
  },
  {
    name: "datumName",
    documentation:
      "The name of the vertical reference datum in a particular naming system. This should only be specified if the above 'code' represents some variation of sea level. An optional short name (code) can also be specified. Specifying a well known datum is highly desired if the above code is a variant of sea level because sea level varies over time and space. An example would be to specify a name of 'Caspian Sea' with a code of '5106' in the 'EPSG' naming system.",
    properties: dataGridWellKnownNameStructProperties
  },
  {
    name: "datumCRS",
    documentation:
      "A reference to the coordinateReferenceSystem object representing the vertical reference datum (i.e., this wellDatum). This should only be specified if the above 'code' represents some variation of sea level.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "kind",
    documentation:
      "Since various activities may use different points as measurement datums, it is useful to characterize the point based on its usage. A well reference datum may have more than one such characterization. For example, it may be the datum used by the driller and logger for measuring their depths. Example usage values would be 'permanent','driller', 'logger' 'WRP' (well reference point) and 'SRP' (site reference point).",
    isMultiple: true
  },
  {
    name: "wellbore",
    documentation:
      "A pointer to the wellbore that contains the reference datum. This should be specified if a measured depth is given.",
    properties: dataGridRefWellWellboreProperties
  },
  {
    name: "rig",
    documentation:
      "A pointer to the rig that contains the device used as a reference datum. The rig may be associated with a wellbore in another well (e.g., pattern drilling using a rig on a track).",
    properties: dataGridRefWellWellboreRigProperties
  },
  {
    name: "elevation",
    documentation:
      "The gravity based elevation coordinate of this reference datum as measured from another datum. Positive moving upward from the elevation datum. An elevation should be given unless this is a vertical reference datum (e.g., sea level).",
    properties: dataGridWellElevationCoordProperties
  },
  {
    name: "measuredDepth",
    documentation:
      'The measured depth coordinate of this reference datum as measured from another datum. The measured depth datum should either be the same as the elevation datum or it should be relatable to the elevation datum through other datums. Positive moving toward the bottomhole from the measured depth datum. This should be given when a local reference is "downhole", such as a kickoff point or ocean bottom template, and the borehole may not be vertical. If a Depth is given then an Elevation should also be given.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "horizontalLocation",
    documentation:
      "The horizontal location of the point being used as a well datum. This may be used when the point is not directly above or below the well point location. For example, a well being drilled from a platform may have its location at the entrance into the sea floor, while the well datum may be located on the drilling rig. Or the well datum may be a kickoff point, that is not directly under the well surface point.",
    properties: dataGridLocationProperties
  },
  {
    name: "comment",
    documentation: "A contextual description of the well reference datum."
  },
  dataGridExtensionNameValue
];
