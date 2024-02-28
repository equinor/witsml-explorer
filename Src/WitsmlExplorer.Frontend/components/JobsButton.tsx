import { Button } from "@equinor/eds-core-react";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsViewPath } from "routes/utils/pathBuilder";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

export interface JobsButtonProps {
  showLabels: boolean;
}

const JobsButton = (props: JobsButtonProps): React.ReactElement => {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { connectedServer } = useConnectedServer();
  const navigate = useNavigate();

  const onClick = () => {
    navigate(getJobsViewPath(connectedServer?.url));
  };

  return (
    <StyledButton
      colors={colors}
      variant={props.showLabels ? "ghost" : "ghost_icon"}
      onClick={onClick}
      disabled={!connectedServer}
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
