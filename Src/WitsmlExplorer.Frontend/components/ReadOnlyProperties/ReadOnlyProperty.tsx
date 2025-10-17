import { Typography } from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export interface ReadOnlyProperty {
  label: string;
  value: string;
}

export const ReadOnlyProperty = ({ label, value }: ReadOnlyProperty) => {
  const {
    operationState: { colors }
  } = useOperationState();

  return (
    <PropertyLayout>
      <PropertyLabel colors={colors}>{label}</PropertyLabel>
      <PropertyValue colors={colors}>{value}</PropertyValue>
    </PropertyLayout>
  );
};

const PropertyLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 400px;
`;

const PropertyLabel = styled(Typography)<{ colors: Colors }>`
  font-size: 0.8rem;
  color: ${(props) => props.colors.text.staticIconsTertiary};
`;

const PropertyValue = styled(Typography)<{ colors: Colors }>`
  color: ${(props) => props.colors.text.staticIconsDefault};
`;
