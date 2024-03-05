import { Typography } from "@equinor/eds-core-react";
import { useContext } from "react";
import styled from "styled-components";
import OperationContext from "../contexts/operationContext";
import { Colors } from "../styles/Colors";

export interface ItemNotFoundProps {
  itemType: string;
}

export function ItemNotFound(props: ItemNotFoundProps) {
  const { itemType } = props;
  const {
    operationState: { colors }
  } = useContext(OperationContext);
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
