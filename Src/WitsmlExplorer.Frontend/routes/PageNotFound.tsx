import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import { Colors } from "../styles/Colors";

export function PageNotFound() {
  const {
    operationState: { colors }
  } = useOperationState();
  return (
    <>
      <Heading colors={colors}>404 Not Found</Heading>
      <Paragraph colors={colors}>
        The requested page could not be found. This may be because the URL is
        misspelled or the content has been removed.
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
