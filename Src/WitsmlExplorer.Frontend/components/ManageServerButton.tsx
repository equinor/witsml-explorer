import { Button, Typography } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import Icon from "../styles/Icons";
import { colors } from "../styles/Colors";
import styled from "styled-components";

const ManageServerButton = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, wells } = navigationState;

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectManageServer, payload: {} });
  };

  return (
    <StyledButton variant="ghost" onClick={onClick} style={{ width: "150px" }}>
      <Icon name="cloudDownload" color={selectedServer?.id && wells.length ? colors.interactive.successResting : colors.text.staticIconsTertiary} />
      <Typography lines={1} style={{ fontSize: "0.75rem" }} color={selectedServer?.id ? colors.interactive.primaryResting : colors.text.staticIconsTertiary}>
        {selectedServer && wells.length ? selectedServer.name : "No Connection"}{" "}
      </Typography>
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
`;
export default ManageServerButton;
