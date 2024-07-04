import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";

// Helper-type to verify that a (nested) property exists on the given type, limited to depth D
type NestedKeys<T, D extends number> = D extends 0
  ? never
  : {
      [K in keyof T]: T[K] extends (infer U)[]
        ? K extends string
          ? `${K}` | `${K}[number]` | `${K}[number].${NestedKeys<U, Prev[D]>}`
          : never
        : T[K] extends object
        ? K extends string
          ? `${K}` | `${K}.${NestedKeys<T[K], Prev[D]>}`
          : never
        : K;
    }[keyof T & string];

// Prev is used to limit NestedKeys to a max depth to avoid infinite typescript checks.
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface CommonProps<T> {
  property: NestedKeys<T, 10>;
  propertyType: PropertyType;
  validator?: (value: any, originalValue: string) => boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

// options are only allowed for PropertyType.Options
type OptionsPropertyProps =
  | { propertyType: PropertyType.Options; options: string[] }
  | {
      propertyType: Exclude<PropertyType, PropertyType.Options>;
      options?: never;
    };

// multiSelect is only allowed for PropertyType.Options
type MultiSelectOptionProps =
  | { propertyType: PropertyType.Options; multiSelect?: boolean }
  | {
      propertyType: Exclude<PropertyType, PropertyType.Options>;
      multiSelect?: never;
    };

// multiline is only allowed for PropertyType.String
type MultiLineProps =
  | { propertyType: PropertyType.String; multiline?: boolean }
  | {
      propertyType: Exclude<PropertyType, PropertyType.String>;
      multiline?: never;
    };

// subproperties for list types
type SubProps<K> =
  | {
      propertyType: PropertyType.List;
      subProps: PropertiesModalProperty<K>[];
      itemPrefix?: string;
    }
  | {
      propertyType: Exclude<PropertyType, PropertyType.List>;
      subProperties?: never;
      itemPrefix?: never;
    };

export type PropertiesModalProperty<T, K = any> = CommonProps<T> &
  OptionsPropertyProps &
  MultiSelectOptionProps &
  MultiLineProps &
  SubProps<K>;
