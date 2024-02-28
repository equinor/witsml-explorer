import { Button } from "@equinor/eds-core-react";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

export interface ServerManagerButtonProps {
  showLabels: boolean;
}

const ServerManagerButton = (
  props: ServerManagerButtonProps
): React.ReactElement => {
  const { connectedServer } = useConnectedServer();
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const navigate = useNavigate();

  const onClick = () => {
    navigate("/");
  };

  const isConnected = !!connectedServer;
  return (
    <StyledButton
      colors={colors}
      variant={props.showLabels ? "ghost" : "ghost_icon"}
      onClick={onClick}
      disabled={!isConnected}
    >
      <Icon name={isConnected ? "cloudDownload" : "cloudOff"} />
      {props.showLabels &&
        (isConnected ? "Server Connections" : "No Connection")}
    </StyledButton>
  );
};

const StyledButton = styled(Button)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

export default ServerManagerButton;
