import { Variants } from "@equinor/eds-core-react/dist/types/components/types";
import { getNestedValue } from "components/Modals/PropertiesModal/NestedPropertyHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
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
): boolean => {
  const originalValue = getNestedValue(originalObject, prop.property);
  const updatedValue = getNestedValue(updates, prop.property);
  const actualValue = getActualValue(
    prop.propertyType,
    updatedValue,
    originalValue
  );
  if (prop.propertyType === PropertyType.List) {
    if (updatedValue === undefined) return true;
    return (updatedValue as any[]).every((subValue) => {
      const originalSubObject = (originalValue as any[]).find(
        (oV) => oV.uid === subValue.uid
      );
      return prop.subProps.every((subProp) =>
        isPropertyValid(subProp, originalSubObject, subValue)
      );
    });
  }
  if (prop.validator && (actualValue || typeof actualValue === "boolean")) {
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
    case PropertyType.List: {
      const updatedUids = (value as any[]).map((v) => v.uid);
      const originalFiltered = (originalValue as any[])
        .map((obj) =>
          Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))
        )
        .filter((obj) => updatedUids.includes(obj.uid));
      const valueFiltered = (value as any[]).map((obj) =>
        Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))
      );
      return JSON.stringify(originalFiltered) !== JSON.stringify(valueFiltered);
    }
    case PropertyType.DateTime:
      return Date.parse(originalValue) !== Date.parse(value);
    default:
      return (
        !(
          value === "" &&
          (originalValue === null || originalValue === undefined)
        ) && value !== originalValue
      );
  }
};

export const formatPropertyValue = (
  property: string,
  propertyType: PropertyType,
  value: string
) => {
  switch (propertyType) {
    case PropertyType.Boolean:
      if (!["true", "false"].includes(value)) return "null";
      return value === "true";
    case PropertyType.Number:
      return parseFloat(value);
    case PropertyType.Measure:
      if (
        propertyType === PropertyType.Measure &&
        property.endsWith(".value") &&
        value !== ""
      ) {
        return parseFloat(value);
      }
  }
  return value;
};

export const getMaxLengthHelperText = (property: string, maxLength: number) => {
  return `${property} must be 1-${maxLength} characters`;
};

export const getTimeZoneHelperText = (property: string) => {
  return `${property} has to be 'Z' or in the format -hh:mm or +hh:mm within the range (-12:00 to +14:00) and minutes has to be 00, 30 or 45`;
};

export const getPhoneNumberHelperText = (property: string) => {
  return `${property} must be an integer of 1-32 characters. Whitespace, dash and plus is accepted`;
};

export const getNumberHelperText = (property: string) => {
  return `${property} must be a valid number`;
};

export const getMeasureHelperText = (property: string) => {
  return `${property} must have a valid number and unit`;
};

export const getBooleanHelperText = (property: string) => {
  return `${property} must be true or false`;
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
