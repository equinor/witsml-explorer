import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { Stack } from "@mui/material";
import { LogHeaderDateTimeField } from "components/Modals/LogHeaderDateTimeField";
import {
  deleteNestedValue,
  getNestedValue,
  setNestedValue
} from "components/Modals/PropertiesModal/NestedPropertyHelpers";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  formatPropertyValue,
  getHelperText,
  getVariant,
  hasPropertyChanged,
  isPropertyValid
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { cloneDeep } from "lodash";
import { ChangeEvent, ReactElement, useState } from "react";
import styled from "styled-components";
import ModalDialog from "../ModalDialog";

// type NestedKeys<T, D extends number> = D extends 0 ? never : {
//     [K in keyof T]: T[K] extends object ?
//     K extends string ? `${K}` | `${K}.${NestedKeys<T[K], Prev[D]>}` : never
//     : K;
// }[keyof T & string];

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

// required props cannot be disabled
type DisabledProps =
  | { required?: true; disabled?: false }
  | { required?: false; disabled?: boolean };

export type PropertiesModalProperty<T> = CommonProps<T> &
  OptionsPropertyProps &
  MultiSelectOptionProps &
  DisabledProps &
  MultiLineProps;

export interface PropertiesModalProps<T> {
  title: string;
  object: T;
  properties: PropertiesModalProperty<T>[];
  onSubmit: (updates: Partial<T>) => void;
}

// TODO: Add docstring. Specify that onSubmit only receives whatever has been actually changed (when that is implemented).
export const PropertiesModal = <T,>(
  props: PropertiesModalProps<T>
): ReactElement => {
  const { title, object, properties, onSubmit } = props;
  const [updates, setUpdates] = useState<Partial<T>>({});
  const allValid = properties.every((prop) =>
    isPropertyValid(prop, object, updates)
  );
  const anyUpdates = Object.keys(updates).length > 0;

  const getInitialSelectedOptions = (prop: PropertiesModalProperty<T>) => {
    const optionsString = getNestedValue(object, prop.property);
    if (!optionsString) return [];
    return prop.multiSelect ? optionsString.split(", ") : [optionsString];
  };

  const onOptionsChange = (
    prop: PropertiesModalProperty<T>,
    selectedItems: string[]
  ) => {
    const updatedValue =
      (prop.multiSelect
        ? selectedItems.sort().join(", ")
        : selectedItems?.[0]) ?? "";
    onChangeProperty(prop.property, prop.propertyType, updatedValue);
  };

  const onChangeProperty = (
    property: string,
    propertyType: PropertyType,
    value: string
  ) => {
    const originalValue = getNestedValue(object, property);
    const formattedValue = formatPropertyValue(property, propertyType, value);
    if (hasPropertyChanged(propertyType, formattedValue, originalValue)) {
      setUpdates((prevUpdates) =>
        setNestedValue(cloneDeep(prevUpdates), property, formattedValue)
      );
    } else {
      setUpdates((prevUpdates) =>
        deleteNestedValue(cloneDeep(prevUpdates), property)
      );
    }
  };

  const getFullUpdateObject = () => {
    const notPartialProperties = [
      PropertyType.Measure,
      PropertyType.RefNameString,
      PropertyType.StratigraphicStruct
    ];
    const fullUpdates = cloneDeep(updates);
    Object.keys(fullUpdates).forEach((property) => {
      const propertyType = properties.find(
        (prop) => prop.property === property
      )?.propertyType;
      if (notPartialProperties.includes(propertyType)) {
        const originalValue = getNestedValue(object, property);
        fullUpdates[property as keyof T] = {
          ...originalValue,
          ...updates[property as keyof T]
        };
      }
    });
    return fullUpdates;
  };

  const onInternalSubmit = async () => {
    // Some datatypes like measures needs both the value and uom in order to update, so make sure the original is used if only partially modified by the user.
    const fullUpdates = getFullUpdateObject();
    onSubmit(fullUpdates);
  };

  return (
    <ModalDialog
      heading={title}
      content={
        <Layout>
          {properties.length === 0 && <p>No properties to update.</p>}
          {properties.map((prop) => {
            switch (prop.propertyType) {
              case PropertyType.Options:
                return (
                  <Autocomplete
                    key={prop.property}
                    label={prop.property}
                    disabled={prop.disabled}
                    options={prop.options || []}
                    initialSelectedOptions={getInitialSelectedOptions(prop)}
                    helperText={getHelperText(prop, object, updates)}
                    variant={getVariant(prop, object, updates)}
                    onOptionsChange={({ selectedItems }) =>
                      onOptionsChange(prop, selectedItems)
                    }
                    onInputChange={(text: string) => {
                      if (!prop.multiSelect) {
                        onChangeProperty(
                          prop.property,
                          prop.propertyType,
                          text
                        );
                      }
                    }}
                    hideClearButton={!prop.multiSelect}
                    multiple={prop.multiSelect}
                  />
                );
              case PropertyType.DateTime:
                return (
                  <LogHeaderDateTimeField
                    key={prop.property}
                    value={
                      getNestedValue(updates, prop.property) ??
                      getNestedValue(object, prop.property)
                    }
                    label={prop.property}
                    disabled={prop.disabled}
                    updateObject={(dateTime: string) => {
                      onChangeProperty(
                        prop.property,
                        prop.propertyType,
                        dateTime
                      );
                    }}
                  />
                );
              case PropertyType.Measure:
                return (
                  <Stack direction="row" key={prop.property}>
                    <TextField
                      id={`${prop.property}.value`}
                      label={prop.property}
                      disabled={prop.disabled}
                      defaultValue={getNestedValue(
                        object,
                        `${prop.property}.value`
                      )}
                      helperText={getHelperText(prop, object, updates)}
                      variant={getVariant(prop, object, updates)}
                      type="number"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChangeProperty(
                          `${prop.property}.value`,
                          prop.propertyType,
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      id={`${prop.property}.uom`}
                      label="unit"
                      disabled={prop.disabled}
                      defaultValue={getNestedValue(
                        object,
                        `${prop.property}.uom`
                      )}
                      variant={getVariant(prop, object, updates)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChangeProperty(
                          `${prop.property}.uom`,
                          prop.propertyType,
                          e.target.value
                        )
                      }
                      style={{
                        width: "300px"
                      }}
                    />
                  </Stack>
                );
              case PropertyType.RefNameString:
              case PropertyType.StratigraphicStruct: {
                const secondaryProperty =
                  prop.propertyType === PropertyType.RefNameString
                    ? "uidRef"
                    : "kind";
                return (
                  <Stack direction="row" key={prop.property}>
                    <TextField
                      id={`${prop.property}.value`}
                      label={prop.property}
                      disabled={prop.disabled}
                      defaultValue={getNestedValue(
                        object,
                        `${prop.property}.value`
                      )}
                      helperText={getHelperText(prop, object, updates)}
                      variant={getVariant(prop, object, updates)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChangeProperty(
                          `${prop.property}.value`,
                          prop.propertyType,
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      id={`${prop.property}.${secondaryProperty}`}
                      label={secondaryProperty}
                      disabled={prop.disabled}
                      defaultValue={getNestedValue(
                        object,
                        `${prop.property}.${secondaryProperty}`
                      )}
                      variant={getVariant(prop, object, updates)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onChangeProperty(
                          `${prop.property}.${secondaryProperty}`,
                          prop.propertyType,
                          e.target.value
                        )
                      }
                      style={{
                        width: "300px"
                      }}
                    />
                  </Stack>
                );
              }
              case PropertyType.String:
              case PropertyType.Number:
                return (
                  <TextField
                    key={prop.property}
                    id={prop.property}
                    label={prop.property}
                    type={
                      prop.propertyType === PropertyType.Number
                        ? "number"
                        : undefined
                    }
                    multiline={prop.multiline} // TODO: multiline fields should capture 'Enter'.
                    disabled={prop.disabled}
                    defaultValue={getNestedValue(object, prop.property)}
                    helperText={getHelperText(prop, object, updates)}
                    variant={getVariant(prop, object, updates)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onChangeProperty(
                        prop.property,
                        prop.propertyType,
                        e.target.value
                      )
                    }
                  />
                );
            }
          })}
        </Layout>
      }
      confirmDisabled={!allValid || !anyUpdates}
      onSubmit={onInternalSubmit}
      isLoading={false}
    />
  );
};

// TODO: Add a "New <objectType>" for all objects (except ChangeLog).

// TODO: Fix the styling so the enabled fields are more visible in dark mode

// TODO: When everything is finished, test the modal properly (both manually and with tests)

// TODO: Test disabled: true for all property types.

const Layout = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
