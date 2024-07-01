import { Variants } from "@equinor/eds-core-react/dist/types/components/types";
import { getNestedValue } from "components/Modals/PropertiesModal/NestedPropertyHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/PropertiesModal";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";

const getActualValue = (
  propertyType: PropertyType,
  value: any,
  originalValue: any
) => {
  switch (propertyType) {
    case PropertyType.RefNameString:
    case PropertyType.StratigraphicStruct:
    case PropertyType.Measure:
      return !value && !originalValue ? null : { ...originalValue, ...value };
    default:
      return value === undefined ? originalValue : value;
  }
};

export const isPropertyValid = <T>(
  prop: PropertiesModalProperty<T>,
  originalObject: T,
  updates: Partial<T>
) => {
  const originalValue = getNestedValue(originalObject, prop.property);
  const updatedValue = getNestedValue(updates, prop.property);
  const actualValue = getActualValue(
    prop.propertyType,
    updatedValue,
    originalValue
  );
  if (prop.validator && actualValue) {
    return prop.validator(actualValue, originalValue);
  }
  const isRequired = prop.required || !!originalValue;
  if (isRequired && !actualValue) {
    return false;
  }
  return true;
};

export const getHelperText = <T>(
  prop: PropertiesModalProperty<T>,
  originalObject: T,
  updates: Partial<T>
) => {
  return isPropertyValid(prop, originalObject, updates) ? "" : prop.helperText;
};

export const getVariant = <T>(
  prop: PropertiesModalProperty<T>,
  originalObject: T,
  updates: Partial<T>
): Variants => {
  return isPropertyValid(prop, originalObject, updates) ? undefined : "error";
};

export const hasPropertyChanged = (
  propertyType: PropertyType,
  value: any,
  originalValue: any
) => {
  switch (propertyType) {
    case PropertyType.DateTime:
      return Date.parse(originalValue) !== Date.parse(value);
    default:
      return (
        !(value === "" && originalValue === null) && value !== originalValue
      );
  }
};

export const formatPropertyValue = (
  property: string,
  propertyType: PropertyType,
  value: string
) => {
  return propertyType === PropertyType.Measure &&
    property.endsWith(".value") &&
    value !== ""
    ? parseFloat(value)
    : value;
};

export const getMaxLengthHelperText = (property: string, maxLength: number) => {
  return `${property} must be 1-${maxLength} characters`;
};

export const getPhoneNumberHelperText = (property: string) => {
  return `${property} must be an integer of 1-32 characters. Whitespace, dash and plus is accepted`;
};

export const getMeasureHelperText = (property: string) => {
  return `${property} must have a valid number and unit`;
};

export const getStratigraphicStructHelperText = (property: string) => {
  return `${property} must have a valid value and kind`;
};

export const getRefNameStringHelperText = (property: string) => {
  return `${property} must have a valid value and uidRef`;
};

export const getOptionHelperText = (property: string) => {
  return `${property} must have a valid option`;
};
