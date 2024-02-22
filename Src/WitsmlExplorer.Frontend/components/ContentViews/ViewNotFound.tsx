import { useContext } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { Colors } from "../../styles/Colors";

export function ViewNotFound() {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  return (
    <>
      <Heading colors={colors}>404 Not Found</Heading>
      <Paragraph colors={colors}>
        The requested content view could not be found. This may be because the
        URL is misspelled or the content has been removed.
      </Paragraph>
    </>
  );
}

const Heading = styled.h1<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  margin-bottom: 1em;
`;

const Paragraph = styled.p<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
