import { Typography } from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import { Colors } from "../styles/Colors";

export interface ItemNotFoundProps {
  itemType: string;
  isMultiple?: boolean;
}

export function ItemNotFound(props: ItemNotFoundProps) {
  const { itemType, isMultiple } = props;
  const {
    operationState: { colors }
  } = useOperationState();

  const warning = isMultiple
    ? `No ${itemType} could be found.`
    : `The requested ${itemType} could not be found.`;

  return (
    <>
      <Heading colors={colors}>{`${itemType} Not Found`}</Heading>
      <Typography>{warning}</Typography>
    </>
  );
}

const Heading = styled.h1<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  margin-bottom: 1em;
`;
