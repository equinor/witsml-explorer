import formatDateString from "components/DateFormatter";
import { getNestedValue } from "components/Modals/PropertiesModal/NestedPropertyHelpers";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { ReadOnlyProperty } from "components/ReadOnlyProperties/ReadOnlyProperty";
import { DecimalPreference } from "contexts/operationStateReducer";
import { useOperationState } from "hooks/useOperationState";
import { measureToString } from "models/measure";
import { ReactElement, ReactNode } from "react";

export interface ReadOnlyPropertiesRendererProps<T> {
  properties: ReadOnlyPropertiesRendererProperty[];
  object: T;
}

export interface ReadOnlyPropertiesRendererProperty {
  label?: string;
  property: string;
  renderProperty?: (property: string) => ReactNode;
  propertyType: PropertyType;
}

export const ReadOnlyPropertiesRenderer = <T,>({
  properties,
  object
}: ReadOnlyPropertiesRendererProps<T>): ReactElement => {
  const {
    operationState: { timeZone, dateTimeFormat, decimals }
  } = useOperationState();
  const decimalSetting =
    decimals !== DecimalPreference.Raw ? parseInt(decimals) : undefined;

  const getFormattedPropertyValue = (
    property: ReadOnlyPropertiesRendererProperty
  ): string => {
    const value = getNestedValue(object, property.property);
    if (value === undefined || value === null) return "-";
    switch (property.propertyType) {
      case PropertyType.StringNumber:
      case PropertyType.Number:
        return decimalSetting
          ? Number(value).toFixed(decimalSetting)
          : String(value);
      case PropertyType.Measure:
        return measureToString(value, decimalSetting);
      case PropertyType.DateTime:
        return formatDateString(value, timeZone, dateTimeFormat);
      case PropertyType.RefNameString:
        return value?.value;
      default:
        return String(value);
    }
  };

  return (
    <>
      {properties.map((prop) => (
        <ReadOnlyProperty
          key={prop.property}
          label={prop.label || prop.property}
          value={getFormattedPropertyValue(prop)}
          renderValue={prop.renderProperty}
        />
      ))}
    </>
  );
};
