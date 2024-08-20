import {
  PropertiesModalMode,
  validText,
  validTimeZone
} from "components/Modals/ModalParts";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getTimeZoneHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import MaxLength from "models/maxLength";
import Well from "models/well";

export const getWellProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Well>[] => [
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
  },
  {
    property: "field",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("field", MaxLength.Name)
  },
  {
    property: "country",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("country", MaxLength.String32)
  },
  {
    property: "operator",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("operator", MaxLength.Name)
  },
  {
    property: "timeZone",
    propertyType: PropertyType.String,
    validator: (value: string) => validTimeZone(value),
    helperText: getTimeZoneHelperText("timeZone"),
    required: true
  },
  {
    property: "numLicense",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("numLicense", MaxLength.Name)
  },
  {
    property: "dateTimeCreation",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "dateTimeLastChange",
    propertyType: PropertyType.DateTime,
    disabled: true
  }
];
