import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { ChangeEvent, ReactElement, useContext, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ModalDialog from "./ModalDialog";

export interface BatchModifyProperty {
  property: string;
  options?: string[];
  validator?: (value: string) => boolean;
  helperText?: string;
}

export interface BatchModifyModalProps {
  title: string;
  properties: BatchModifyProperty[];
  onSubmit: (batchUpdates: { [key: string]: string }) => void;
}

export const BatchModifyPropertiesModal = (
  props: BatchModifyModalProps
): ReactElement => {
  const { title, properties, onSubmit } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const [batchUpdates, setBatchUpdates] = useState<{ [key: string]: string }>(
    properties.reduce((acc, prop) => ({ ...acc, [prop.property]: "" }), {})
  );
  const allValid = properties.every(
    (prop) =>
      !prop.validator ||
      !batchUpdates[prop.property] ||
      prop.validator(batchUpdates[prop.property])
  );
  const allEmpty = properties.every((prop) => !batchUpdates[prop.property]);

  const onChangeProperty = (property: string, value: string) => {
    setBatchUpdates({
      ...batchUpdates,
      [property]: value
    });
  };

  const onInternalSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    // Remove empty properties as they should not be updated
    const filteredBatchUpdates = Object.fromEntries(
      Object.entries(batchUpdates).filter(([, value]) => value !== "")
    );

    // Create nested objects for properties with . in the name (e.g. commonData.source.name)
    const nestedBatchUpdates = Object.entries(filteredBatchUpdates).reduce<{
      [key: string]: any;
    }>((acc, [property, value]) => {
      const keys = property.split(".");
      keys.reduce((obj, key, index) => {
        if (index === keys.length - 1) {
          obj[key] = value;
        } else {
          obj[key] = obj[key] || {};
        }
        return obj[key];
      }, acc);
      return acc;
    }, {});

    onSubmit(nestedBatchUpdates);
  };

  return (
    <ModalDialog
      heading={title}
      content={
        <Layout>
          {properties.length === 0 && <p>No properties to update.</p>}
          {properties.map((property) =>
            property.options ? (
              <Autocomplete
                key={property.property}
                label={property.property}
                options={property.options}
                onOptionsChange={({ selectedItems }) =>
                  onChangeProperty(property.property, selectedItems?.[0] ?? "")
                }
              />
            ) : (
              <TextField
                key={property.property}
                id={property.property}
                label={property.property}
                defaultValue={batchUpdates[property.property]}
                helperText={
                  property.validator &&
                  !property.validator(batchUpdates[property.property])
                    ? property.helperText ?? ""
                    : ""
                }
                variant={
                  property.validator &&
                  !property.validator(batchUpdates[property.property])
                    ? "error"
                    : undefined
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onChangeProperty(property.property, e.target.value)
                }
              />
            )
          )}
        </Layout>
      }
      confirmDisabled={!allValid || allEmpty}
      onSubmit={onInternalSubmit}
      isLoading={false}
    />
  );
};

const Layout = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
