import { Button } from "@equinor/eds-core-react";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

export interface ServerManagerButtonProps {
  showLabels: boolean;
}

const ServerManagerButton = (
  props: ServerManagerButtonProps
): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, wells } = navigationState;
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  const onClick = () => {
    dispatchNavigation({
      type: NavigationType.SelectServerManager,
      payload: {}
    });
  };

  const connected = selectedServer && wells.length;
  return (
    <StyledButton
      colors={colors}
      variant={props.showLabels ? "ghost" : "ghost_icon"}
      onClick={onClick}
    >
      <Icon name={connected ? "cloudDownload" : "cloudOff"} />
      {props.showLabels && (connected ? "Server Connections" : "No Connection")}
    </StyledButton>
  );
};

const StyledButton = styled(Button)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

export default ServerManagerButton;
