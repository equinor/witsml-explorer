import {
  PropertiesModalMode,
  validOption,
  validText
} from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";
import Trajectory, { aziRefValues } from "models/trajectory";

export const getTrajectoryProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Trajectory>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "dTimTrajStart",
    propertyType: PropertyType.DateTime,
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "dTimTrajEnd",
    propertyType: PropertyType.DateTime,
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "serviceCompany",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("serviceCompany", MaxLength.Name)
  },
  {
    property: "mdMin",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "mdMax",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "aziRef",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, aziRefValues),
    helperText: getOptionHelperText("aziRef"),
    options: aziRefValues
  },
  {
    property: "commonData.sourceName",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("sourceName", MaxLength.Name),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
  }
];
