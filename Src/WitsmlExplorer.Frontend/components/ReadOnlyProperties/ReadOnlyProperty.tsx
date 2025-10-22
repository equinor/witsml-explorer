import { Typography } from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import { ReactNode } from "react";

export interface ReadOnlyProperty {
  label: string;
  value?: string;
  renderValue?: (property: unknown) => ReactNode;
}

export const ReadOnlyProperty = ({
  label,
  value,
  renderValue
}: ReadOnlyProperty) => {
  const {
    operationState: { colors }
  } = useOperationState();

  return (
    <PropertyLayout>
      <PropertyLabel colors={colors}>{label}</PropertyLabel>
      {renderValue ? (
        renderValue(value)
      ) : (
        <PropertyValue colors={colors}>{value}</PropertyValue>
      )}
    </PropertyLayout>
  );
};

const PropertyLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: minmax(150px, 300px);
`;

const PropertyLabel = styled(Typography)<{ colors: Colors }>`
  font-size: 0.8rem;
  color: ${(props) => props.colors.text.staticIconsTertiary};
`;

const PropertyValue = styled(Typography)<{ colors: Colors }>`
  color: ${(props) => props.colors.text.staticIconsDefault};
`;
