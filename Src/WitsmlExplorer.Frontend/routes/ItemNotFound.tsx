import { Typography } from "@equinor/eds-core-react";
import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import { Colors } from "../styles/Colors";

export interface ItemNotFoundProps {
  itemType: string;
}

export function ItemNotFound(props: ItemNotFoundProps) {
  const { itemType } = props;
  const {
    operationState: { colors }
  } = useOperationState();
  return (
    <>
      <Heading colors={colors}>{`${itemType} Not Found`}</Heading>
      <Typography>{`The requested ${itemType} could not be found.`}</Typography>
    </>
  );
}

const Heading = styled.h1<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  margin-bottom: 1em;
`;
