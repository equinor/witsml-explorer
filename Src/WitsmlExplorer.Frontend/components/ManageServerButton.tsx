import { Button } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import styled from "styled-components";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import Icon from "../styles/Icons";

const ManageServerButton = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, wells } = navigationState;

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectManageServer, payload: {} });
  };

  const connected = selectedServer && wells.length;
  return (
    <StyledButton variant="ghost" onClick={onClick}>
      <Icon name={connected ? "cloudDownload" : "cloudOff"} />
      {connected ? "Server Connections" : "No Connection"}
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
`;
export default ManageServerButton;
