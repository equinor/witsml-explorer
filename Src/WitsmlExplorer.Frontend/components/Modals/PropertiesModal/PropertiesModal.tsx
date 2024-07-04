import { getNestedValue } from "components/Modals/PropertiesModal/NestedPropertyHelpers";
import { PropertiesRenderer } from "components/Modals/PropertiesModal/PropertiesRenderer";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { isPropertyValid } from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { cloneDeep } from "lodash";
import { ReactElement, useState } from "react";
import styled from "styled-components";
import ModalDialog, { ModalWidth } from "../ModalDialog";

export interface PropertiesModalProps<T> {
  title: string;
  object: T;
  properties: PropertiesModalProperty<T>[];
  onSubmit: (updates: Partial<T>) => void;
}

/**
 * PropertiesModal component
 *
 * A modal dialog for editing properties of a given object. It renders a list of properties,
 * validates the input, and submits only the modified properties via the onSubmit callback.
 *
 * @template T - The type of the object whose properties are being edited.
 *
 * @param {PropertiesModalProps<T>} props - The props for the PropertiesModal component.
 * @param {string} props.title - The title of the modal dialog.
 * @param {T} props.object - The object whose properties are to be edited.
 * @param {PropertiesModalProperty<T>[]} props.properties - The list of properties available for editing.
 * @param {(updates: Partial<T>) => void} props.onSubmit - Callback for submitting the modified properties.
 *
 * @returns {ReactElement} A React element representing the properties modal dialog.
 *
 * @remarks
 * - The `onSubmit` callback only receives modified properties.
 * - The modal validates each property before enabling the submit button.
 */

export const PropertiesModal = <T,>(
  props: PropertiesModalProps<T>
): ReactElement => {
  const { title, object, properties, onSubmit } = props;
  const [updates, setUpdates] = useState<Partial<T>>({});
  const allValid = properties.every((prop) =>
    isPropertyValid(prop, object, updates)
  );
  const anyUpdates = Object.keys(updates).length > 0;

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
      width={ModalWidth.LARGE}
      heading={title}
      content={
        <Layout>
          {properties.length === 0 && <p>No properties to update.</p>}
          <PropertiesRenderer
            properties={properties}
            object={object}
            updates={updates}
            onChange={setUpdates}
          />
        </Layout>
      }
      confirmDisabled={!allValid || !anyUpdates}
      onSubmit={onInternalSubmit}
      isLoading={false}
    />
  );
};

const Layout = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;
