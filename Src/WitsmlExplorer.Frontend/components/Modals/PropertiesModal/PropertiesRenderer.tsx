import { Autocomplete, TextField, Typography } from "@equinor/eds-core-react";
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
  hasPropertyChanged
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { cloneDeep } from "lodash";
import { ChangeEvent, Fragment, KeyboardEvent, ReactElement } from "react";
import styled from "styled-components";

interface PropertiesRendererProps<T> {
  properties: PropertiesModalProperty<T>[];
  object: T;
  updates: Partial<T>;
  onChange: (updates: Partial<T>) => void;
}

export const PropertiesRenderer = <T,>({
  properties,
  object,
  updates,
  onChange
}: PropertiesRendererProps<T>): ReactElement => {
  const getInitialSelectedOptions = (prop: PropertiesModalProperty<T>) => {
    const optionsString = getNestedValue(object, prop.property)?.toString();
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
      onChange(setNestedValue(cloneDeep(updates), property, formattedValue));
    } else {
      onChange(deleteNestedValue(cloneDeep(updates), property));
    }
  };

  return (
    <>
      {properties.map((prop) => {
        switch (prop.propertyType) {
          case PropertyType.List: {
            const subObjectList = getNestedValue(object, prop.property) ?? [];
            const subUpdatesList = getNestedValue(updates, prop.property) ?? [];
            const onSubObjectChange = (
              subObject: any,
              updates: Partial<any>
            ) => {
              const fullSubUpdate = { ...cloneDeep(subObject), ...updates };
              const updateIndex = subUpdatesList.findIndex(
                (update: any) => update.uid === subObject.uid
              );
              let fullSubUpdateList = cloneDeep(subUpdatesList);
              if (updateIndex >= 0) {
                fullSubUpdateList[updateIndex] = fullSubUpdate;
              } else {
                fullSubUpdateList = [...fullSubUpdateList, fullSubUpdate];
              }
              onChangeProperty(
                prop.property,
                prop.propertyType,
                fullSubUpdateList
              );
            };
            return (
              <Fragment key={prop.property}>
                {subObjectList.map((subObject: any, i: number) => (
                  <Fragment key={prop.property + subObject.uid}>
                    <ListHeaderLayout>
                      <Typography>
                        {prop.itemPrefix +
                          (subObject.name ||
                            subObject.mnemonic ||
                            subObject.uid ||
                            i.toString())}
                      </Typography>
                    </ListHeaderLayout>
                    <PropertiesRenderer
                      properties={prop.subProps}
                      object={subObject}
                      updates={
                        subUpdatesList.find(
                          (subUpdate: any) => subUpdate.uid === subObject.uid
                        ) ?? {}
                      }
                      onChange={(updates) =>
                        onSubObjectChange(subObject, updates)
                      }
                    />
                  </Fragment>
                ))}
              </Fragment>
            );
          }
          case PropertyType.Boolean:
          case PropertyType.Options: {
            const options =
              (prop.propertyType === PropertyType.Boolean
                ? ["true", "false"]
                : prop.options) ?? [];
            return (
              <Autocomplete
                key={prop.property}
                label={prop.property}
                disabled={prop.disabled}
                options={options}
                initialSelectedOptions={getInitialSelectedOptions(prop)}
                helperText={getHelperText(prop, object, updates)}
                variant={getVariant(prop, object, updates)}
                onOptionsChange={({ selectedItems }) =>
                  onOptionsChange(prop, selectedItems)
                }
                onInputChange={(text: string) => {
                  if (!prop.multiSelect) {
                    onChangeProperty(prop.property, prop.propertyType, text);
                  }
                }}
                hideClearButton={!prop.multiSelect}
                multiple={prop.multiSelect}
              />
            );
          }
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
                required={prop.required}
                updateObject={(dateTime: string) => {
                  onChangeProperty(prop.property, prop.propertyType, dateTime);
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
                  defaultValue={getNestedValue(object, `${prop.property}.uom`)}
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
          case PropertyType.StringNumber:
          case PropertyType.Number:
            return (
              <TextField
                key={prop.property}
                id={prop.property}
                label={prop.property}
                type={
                  prop.propertyType === PropertyType.Number ||
                  prop.propertyType === PropertyType.StringNumber
                    ? "number"
                    : undefined
                }
                multiline={prop.multiline}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (prop.multiline && e.key === "Enter") e.stopPropagation();
                }}
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
    </>
  );
};

const ListHeaderLayout = styled.div`
  grid-column: 1 / -1;
  margin-top: 12px;
`;
