import { Button } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import OperationContext from "../contexts/operationContext";
import { Colors } from "../styles/Colors";
import Icon from "../styles/Icons";

export interface JobsButtonProps {
  showLabels: boolean;
}

const JobsButton = (props: JobsButtonProps): React.ReactElement => {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { authorizationState } = useAuthorizationState();
  const navigate = useNavigate();

  const onClick = () => {
    navigate(
      `servers/${encodeURIComponent(authorizationState?.server?.url)}/jobs`
    );
  };

  return (
    <StyledButton
      colors={colors}
      variant={props.showLabels ? "ghost" : "ghost_icon"}
      onClick={onClick}
      disabled={!authorizationState?.server}
    >
      <Icon name="assignment" />
      {props.showLabels && "Jobs"}
    </StyledButton>
  );
};

const StyledButton = styled(Button)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

export default JobsButton;
