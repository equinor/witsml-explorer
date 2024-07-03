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
import MudLog from "models/mudLog";

export const getMudLogProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<MudLog>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "mudLogCompany",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("mudLogCompany", MaxLength.Name)
  },
  {
    property: "mudLogEngineers",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Description),
    helperText: getMaxLengthHelperText("mudLogEngineers", MaxLength.Description)
  },
  {
    property: "objectGrowing",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "startMd",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "endMd",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
  },
  {
    property: "commonData.dTimCreation",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "commonData.dTimLastChange",
    propertyType: PropertyType.DateTime,
    disabled: true
  }
];
