import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { getMaxLengthHelperText } from "components/Modals/PropertiesModal/ValidationHelpers";
import MaxLength from "models/maxLength";
import ObjectOnWellbore from "models/objectOnWellbore";

export const getCommonObjectOnWellboreProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<ObjectOnWellbore>[] => [
  {
    property: "wellUid",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "wellName",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "wellboreUid",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "wellboreName",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "name",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("name", MaxLength.Name),
    required: true
  }
];
