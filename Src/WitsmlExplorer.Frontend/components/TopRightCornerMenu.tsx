import { Button, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { ReactElement, useContext } from "react";
import styled from "styled-components";
import NavigationContext from "../contexts/navigationContext";
import OperationContext from "../contexts/operationContext";
import OperationType from "../contexts/operationType";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import { getAccountInfo, msalEnabled, signOut } from "../msal/MsalAuthProvider";
import AuthorizationService from "../services/authorizationService";
import { Colors } from "../styles/Colors";
import Icon from "../styles/Icons";
import ContextMenu from "./ContextMenus/ContextMenu";
import JobsButton from "./JobsButton";
import { SettingsModal } from "./Modals/SettingsModal";
import UserCredentialsModal, { UserCredentialsModalProps } from "./Modals/UserCredentialsModal";
import ServerManagerButton from "./ServerManagerButton";

const TopRightCornerMenu = (): React.ReactElement => {
  const {
    navigationState: { selectedServer },
    dispatchNavigation
  } = useContext(NavigationContext);
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const { width: documentWidth } = useDocumentDimensions();
  const showLabels = documentWidth > 1180;

  const accountMenu = (
    <ContextMenu
      menuItems={[
        <StyledMenuItem key={"account"}>
          <Typography style={{ overflow: "clip", textOverflow: "ellipsis" }}>{getAccountInfo()?.name}</Typography>
        </StyledMenuItem>,
        <StyledMenuItem
          key={"signout"}
          onClick={() => {
            const logout = async () => {
              await AuthorizationService.deauthorize();
              signOut();
            };
            logout();
            dispatchOperation({ type: OperationType.HideContextMenu });
          }}
        >
          Logout
        </StyledMenuItem>
      ]}
    />
  );

  const onOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, menu: ReactElement) => {
    const position = { mouseX: event.currentTarget.getBoundingClientRect().left, mouseY: event.currentTarget.getBoundingClientRect().bottom };
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: menu, position } });
  };

  const openSettingsMenu = () => {
    dispatchOperation({ type: OperationType.DisplayModal, payload: <SettingsModal /> });
  };

  const openCredentialsModal = () => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: selectedServer,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(selectedServer, username, dispatchNavigation);
      }
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  return (
    <Layout>
      {selectedServer?.currentUsername && (
        <StyledButton colors={colors} variant={showLabels ? "ghost" : "ghost_icon"} onClick={openCredentialsModal}>
          <Icon name="person" />
          {showLabels && selectedServer.currentUsername}
        </StyledButton>
      )}
      <ServerManagerButton showLabels={showLabels} />
      <JobsButton showLabels={showLabels} />
      <StyledButton colors={colors} variant={showLabels ? "ghost" : "ghost_icon"} onClick={openSettingsMenu}>
        <Icon name="settings" />
        {showLabels && "Settings"}
      </StyledButton>
      {msalEnabled && (
        <Button variant={showLabels ? "ghost" : "ghost_icon"} onClick={(event) => onOpenMenu(event, accountMenu)}>
          <Icon name="accountCircle" />
          {showLabels && "Account"}
        </Button>
      )}
    </Layout>
  );
};

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-right: 1rem;
  width: auto;
`;

const StyledButton = styled(Button)<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  white-space: nowrap;
`;

const StyledMenuItem = styled(MenuItem)`
  && {
    width: 13rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    &&:focus {
      outline: 0;
    }
  }
`;

export default TopRightCornerMenu;
