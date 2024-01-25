import { useIsAuthenticated } from "@azure/msal-react";
import {
  Button,
  ButtonProps,
  Table,
  Typography
} from "@equinor/eds-core-react";
import ServerModal, {
  showDeleteServerModal
} from "components/Modals/ServerModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import {
  FilterContext,
  VisibilityStatus,
  allVisibleObjects
} from "contexts/filter";
import { UpdateServerListAction } from "contexts/modificationActions";
import ModificationType from "contexts/modificationType";
import { SelectServerAction } from "contexts/navigationActions";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ObjectType } from "models/objectType";
import { Server, emptyServer } from "models/server";
import { adminRole, getUserAppRoles, msalEnabled } from "msal/MsalAuthProvider";
import React, { useContext, useEffect, useState } from "react";
import AuthorizationService, {
  AuthorizationState,
  AuthorizationStatus
} from "services/authorizationService";
import CapService from "services/capService";
import NotificationService from "services/notificationService";
import ServerService from "services/serverService";
import WellService from "services/wellService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";
import {
  STORAGE_FILTER_HIDDENOBJECTS_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

const NEW_SERVER_ID = "1";

const ServerManager = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, servers, wells } = navigationState;
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const { updateSelectedFilter } = useContext(FilterContext);
  const [hasFetchedServers, setHasFetchedServers] = useState(false);
  const editDisabled = msalEnabled && !getUserAppRoles().includes(adminRole);
  const [authorizationState, setAuthorizationState] =
    useState<AuthorizationState>();

  useEffect(() => {
    const unsubscribeFromCredentialsEvents =
      AuthorizationService.onAuthorizationChangeEvent.subscribe(
        async (authorizationState) => {
          setAuthorizationState(authorizationState);
        }
      );
    return () => {
      unsubscribeFromCredentialsEvents();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const onCurrentLoginStateChange = async () => {
      if (
        selectedServer == null ||
        wells.length !== 0 ||
        (authorizationState &&
          authorizationState.status != AuthorizationStatus.Authorized)
      ) {
        return;
      }
      try {
        const [wells, supportedObjects] = await Promise.all([
          WellService.getWells(),
          CapService.getCapObjects()
        ]);
        updateVisibleObjects(supportedObjects);
        updateSelectedFilter({
          searchResults: []
        });
        dispatchNavigation({
          type: ModificationType.UpdateWells,
          payload: { wells: wells }
        });
      } catch (error) {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(selectedServer.url),
          message: error.message,
          isSuccess: false
        });
        dispatchNavigation({
          type: NavigationType.SelectServer,
          payload: { server: null }
        });
      }
    };
    onCurrentLoginStateChange();
    return () => {
      abortController.abort();
    };
  }, [msalEnabled, selectedServer, authorizationState]);

  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  useEffect(() => {
    if (isAuthenticated && !hasFetchedServers) {
      const abortController = new AbortController();
      const getServers = async () => {
        const freshServers = await ServerService.getServers(
          abortController.signal
        );
        setHasFetchedServers(true);
        const action: UpdateServerListAction = {
          type: ModificationType.UpdateServerList,
          payload: { servers: freshServers }
        };
        dispatchNavigation(action);
      };
      getServers();

      return () => {
        abortController.abort();
      };
    }
  }, [isAuthenticated, hasFetchedServers]);

  const updateVisibleObjects = (supportedObjects: string[]) => {
    const updatedVisibility = { ...allVisibleObjects };
    const hiddenItems = getLocalStorageItem<ObjectType[]>(
      STORAGE_FILTER_HIDDENOBJECTS_KEY,
      { defaultValue: [] }
    );
    hiddenItems.forEach(
      (objectType) => (updatedVisibility[objectType] = VisibilityStatus.Hidden)
    );
    Object.values(ObjectType)
      .filter(
        (objectType) =>
          !supportedObjects
            .map((o) => o.toLowerCase())
            .includes(objectType.toLowerCase())
      )
      .forEach(
        (objectType) =>
          (updatedVisibility[objectType] = VisibilityStatus.Disabled)
      );
    updateSelectedFilter({ objectVisibilityStatus: updatedVisibility });
  };

  const onSelectItem = async (server: Server) => {
    if (server.id === selectedServer?.id) {
      const action: SelectServerAction = {
        type: NavigationType.SelectServer,
        payload: { server: null }
      };
      dispatchNavigation(action);
    } else {
      const userCredentialsModalProps: UserCredentialsModalProps = {
        server,
        onConnectionVerified: (username) => {
          dispatchOperation({ type: OperationType.HideModal });
          AuthorizationService.onAuthorized(
            server,
            username,
            dispatchNavigation
          );
          const action: SelectServerAction = {
            type: NavigationType.SelectServer,
            payload: { server }
          };
          dispatchNavigation(action);
        }
      };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <UserCredentialsModal {...userCredentialsModalProps} />
      });
    }
  };

  const onEditItem = (server: Server) => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ServerModal editDisabled={editDisabled} server={server} />
    });
  };

  const CellStyle = {
    color: colors.interactive.primaryResting,
    padding: "0.3rem",
    borderBottom: `2px solid ${colors.interactive.disabledBorder}`
  };
  const CellHeaderStyle = {
    ...CellStyle,
    background: colors.ui.backgroundLight
  };
  const CloudIconStyle = {
    textlign: "center",
    borderBottom: `2px solid ${colors.interactive.disabledBorder}`
  };

  const isConnected = (server: Server): boolean => {
    return selectedServer?.id == server.id && wells.length != 0;
  };

  return (
    <>
      <Header>
        <Typography
          style={{ color: colors.infographic.primaryMossGreen }}
          bold={true}
        >
          Manage Connections
        </Typography>
        <StyledButton
          colors={colors}
          variant="outlined"
          value={NEW_SERVER_ID}
          key={NEW_SERVER_ID}
          disabled={editDisabled}
          onClick={() => onEditItem(emptyServer())}
        >
          <Icon name="cloudDownload" />
          New server
        </StyledButton>
      </Header>
      <Table style={{ width: "100%" }} className="serversList">
        <Table.Head>
          <Table.Row>
            <Table.Cell style={CellHeaderStyle}>Server Name</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Server</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Username</Table.Cell>
            <Table.Cell style={CellHeaderStyle} />
            <Table.Cell style={CellHeaderStyle}>Status</Table.Cell>
            <Table.Cell style={CellHeaderStyle}></Table.Cell>
            <Table.Cell style={CellHeaderStyle}></Table.Cell>
          </Table.Row>
        </Table.Head>
        <StyledTableBody colors={colors}>
          {servers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((server: Server) => (
              <Table.Row id={server.id} key={server.id}>
                <Table.Cell style={CellStyle}>
                  {isConnected(server) ? (
                    <StyledLink
                      onClick={() =>
                        dispatchNavigation({
                          type: NavigationType.SelectServer,
                          payload: { server }
                        })
                      }
                    >
                      {server.name}
                    </StyledLink>
                  ) : (
                    server.name
                  )}
                </Table.Cell>
                <Table.Cell style={CellStyle}>{server.url}</Table.Cell>
                <Table.Cell style={CellStyle}>
                  {server.currentUsername == null ? "" : server.currentUsername}
                </Table.Cell>
                <Table.Cell style={CloudIconStyle}>
                  <Icon
                    color={
                      isConnected(server)
                        ? colors.interactive.successResting
                        : colors.text.staticIconsTertiary
                    }
                    name="cloudDownload"
                  />
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <ConnectButton
                    colors={colors}
                    isConnected={isConnected(server)}
                    onClick={() => onSelectItem(server)}
                  />
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button variant="ghost" onClick={() => onEditItem(server)}>
                    <Icon name="edit" size={24} />
                  </Button>
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button
                    disabled={editDisabled}
                    variant="ghost"
                    onClick={() =>
                      showDeleteServerModal(
                        server,
                        dispatchOperation,
                        dispatchNavigation,
                        selectedServer
                      )
                    }
                  >
                    <Icon name="deleteToTrash" size={24} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
        </StyledTableBody>
      </Table>
    </>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.9rem;
  align-items: center;
`;

interface ConnectButtonProps extends ButtonProps {
  isConnected: boolean;
  colors: Colors;
}

const ConnectButton = ({ isConnected, ...props }: ConnectButtonProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  return (
    <StyledConnectButton
      colors={colors}
      {...props}
      variant="outlined"
      isConnected={isConnected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isConnected ? (isHovered ? "Disconnect" : "Connected") : "Connect"}
    </StyledConnectButton>
  );
};

const StyledConnectButton = styled(Button)<{
  isConnected: boolean;
  colors: Colors;
}>`
  border-radius: 20px;
  width: 5.75rem;
  height: 1.5rem;
  ${(props) =>
    props.isConnected
      ? `
    color: ${props.colors.interactive.primaryResting};
    border-color: ${props.colors.interactive.successResting};
    &:hover {
      color: ${props.colors.interactive.dangerHover};
      border-color: ${props.colors.interactive.dangerHover};
      background-color: transparent;
    }
  `
      : `
    color: ${props.colors.text.staticIconsDefault};
  `}
  &:hover {
    border-radius: 20px;
  }
`;

const StyledTableBody = styled(Table.Body)<{ colors: Colors }>`
  tr:nth-child(even) {
    background-color: ${(props) => props.colors.ui.backgroundLight};
  }

  tr:nth-child(odd) {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;

const StyledLink = styled.a`
  cursor: pointer;
  text-decoration: underline;
  &&:hover {
    text-decoration: none;
  }
`;

const StyledButton = styled(Button)<{ colors?: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

export default ServerManager;
