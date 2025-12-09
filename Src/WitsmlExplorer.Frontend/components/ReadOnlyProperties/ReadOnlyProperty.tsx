import { Tooltip as EdsTooltip, Typography } from "@equinor/eds-core-react";
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

  const renderValueWithTooltip = () => {
    if (value === "-")
      return <PropertyValue colors={colors}>{value}</PropertyValue>;
    else
      return (
        <Tooltip title={value}>
          <PropertyValue colors={colors}>{value}</PropertyValue>
        </Tooltip>
      );
  };

  return (
    <PropertyLayout>
      <PropertyLabel colors={colors}>{label}</PropertyLabel>
      {renderValue ? (
        renderValue(value)
      ) : (
        <EllipsibleHolder>{renderValueWithTooltip()}</EllipsibleHolder>
      )}
    </PropertyLayout>
  );
};

const PropertyLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PropertyLabel = styled(Typography)<{ colors: Colors }>`
  font-size: 12px;
  color: ${(props) => props.colors.text.staticIconsTertiary} !important;
`;

const PropertyValue = styled(Typography)<{ colors: Colors }>`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  color: ${(props) => props.colors.text.staticIconsDefault};
  width: fit-content;
  max-width: 100%;
`;

const Tooltip = styled(EdsTooltip)`
  white-space: pre-wrap;
  max-width: 30rem;
  width: auto;
`;

const EllipsibleHolder = styled.div`
  min-width: 0;
`;
