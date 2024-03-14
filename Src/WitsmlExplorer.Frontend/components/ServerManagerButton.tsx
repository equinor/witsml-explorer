import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
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
    <Button
      colors={colors}
      variant={props.showLabels ? "ghost" : "ghost_icon"}
      onClick={onClick}
      disabled={!isConnected}
    >
      <Icon name={isConnected ? "cloudDownload" : "cloudOff"} />
      {props.showLabels &&
        (isConnected ? "Server Connections" : "No Connection")}
    </Button>
  );
};

export default ServerManagerButton;
