import { Button } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import styled from "styled-components";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import Icon from "../styles/Icons";

export interface ServerManagerButtonProps {
  showLabels: boolean;
}

const ServerManagerButton = (props: ServerManagerButtonProps): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, wells } = navigationState;

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectServerManager, payload: {} });
  };

  const connected = selectedServer && wells.length;
  return (
    <StyledButton variant={props.showLabels ? "ghost" : "ghost_icon"} onClick={onClick}>
      <Icon name={connected ? "cloudDownload" : "cloudOff"} />
      {props.showLabels && (connected ? "Server Connections" : "No Connection")}
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
`;
export default ServerManagerButton;
