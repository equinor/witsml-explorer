import { useOperationState } from "hooks/useOperationState";
import styled from "styled-components";
import { useErrorMessage } from "../../hooks/useErrorMessage";
import { Colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";

export function ErrorView() {
  const errorMessage = useErrorMessage();
  const {
    operationState: { colors }
  } = useOperationState();

  return (
    <>
      <ErrorTitleContainer>
        <Icon
          name={"errorFilled"}
          size={48}
          color={colors.interactive.dangerResting}
        />
        <Heading colors={colors}>{"An error occurred!"}</Heading>
      </ErrorTitleContainer>
      <ErrorMessage colors={colors}>{errorMessage}</ErrorMessage>
    </>
  );
}

const ErrorTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Heading = styled.h1<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  margin-top: 1em;
  margin-bottom: 1em;
`;

const ErrorMessage = styled.pre<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
