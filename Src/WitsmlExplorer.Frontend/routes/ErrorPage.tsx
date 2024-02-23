import styled from "styled-components";
import { useErrorMessage } from "../hooks/useErrorMessage";
import Icon from "../styles/Icons";

export function ErrorPage() {
  const errorMessage = useErrorMessage();

  return (
    <>
      <ErrorTitleContainer>
        <Icon name={"errorFilled"} size={48} color={"red"} />
        <h1>An error occurred!</h1>
      </ErrorTitleContainer>
      <pre>{errorMessage}</pre>
    </>
  );
}

const ErrorTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
