import { useIsAuthenticated } from "@azure/msal-react";
import {
  ButtonProps,
  Switch,
  Table,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { useQueryClient } from "@tanstack/react-query";
import ServerModal, {
  showDeleteServerModal
} from "components/Modals/ServerModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import ProgressSpinner from "components/ProgressSpinner";
import { Button } from "components/StyledComponents/Button";
import { CommonPanelContainer } from "components/StyledComponents/Container";
import { useConnectedServer } from "contexts/connectedServerContext";
import { FilterContext } from "contexts/filter";
import { useLoggedInUsernames } from "contexts/loggedInUsernamesContext";
import { LoggedInUsernamesActionType } from "contexts/loggedInUsernamesReducer";
import { UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { getServersQueryKey, useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { emptyServer, Server } from "models/server";
import { adminRole, getUserAppRoles, msalEnabled } from "msal/MsalAuthProvider";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWellsViewPath } from "routes/utils/pathBuilder";
import AuthorizationService from "services/authorizationService";
import NotificationService from "services/notificationService";
import ServerService from "services/serverService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";
import {
  setLocalStorageItem,
  STORAGE_FILTER_PRIORITYSERVERS_KEY
} from "tools/localStorageHelpers";

const NEW_SERVER_ID = "1";

const ServerManager = (): React.ReactElement => {
  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  const queryClient = useQueryClient();
  const { servers, isFetching, isError } = useGetServers({
    enabled: isAuthenticated,
    placeholderData: []
  });
  const {
    operationState: { colors, theme },
    dispatchOperation
  } = useOperationState();
  const editDisabled = msalEnabled && !getUserAppRoles().includes(adminRole);
  const navigate = useNavigate();
  const { connectedServer, setConnectedServer } = useConnectedServer();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();
  const [filterByName, setFilterByName] = useState<string>("");
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);
  const filteredServers = useServerFilter(servers, filterByName);

  useEffect(() => {
    if (isError) {
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: null,
        message:
          "Unable to connect to the API. Please verify that the API is running and refresh the page to try again.",
        isSuccess: false,
        severity: "error"
      });
    }
  }, [isError]);

  const connectServer = async (server: Server) => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(server, username);
        AuthorizationService.setSelectedServer(server);
        dispatchLoggedInUsernames({
          type: LoggedInUsernamesActionType.AddLoggedInUsername,
          payload: { serverId: server.id, username }
        });
        setConnectedServer(server);
        navigate(getWellsViewPath(server.url));
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const disconnectServer = () => {
    AuthorizationService.setSelectedServer(null);
    setConnectedServer(null);
  };

  const onEditItem = (server: Server) => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ServerModal editDisabled={editDisabled} server={server} />
    });
  };

  const togglePriority = async (server: Server) => {
    try {
      // Optimistically update the query cache to avoid full rerenders and to keep the scroll position.
      queryClient.setQueryData(getServersQueryKey(), (oldServers: Server[]) =>
        oldServers?.map((s) =>
          s.id === server.id ? { ...s, isPriority: !s.isPriority } : s
        )
      );

      const freshServer = await ServerService.updateServer({
        ...server,
        isPriority: !server.isPriority
      });
      if (freshServer) {
        AuthorizationService.onServerStateChange(freshServer);
      }
    } catch (error) {
      // Roll back on failure
      queryClient.setQueryData(getServersQueryKey(), (oldServers: Server[]) =>
        oldServers?.map((s) => (s.id === server.id ? server : s))
      );

      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: null,
        message: `Unable to update priority: ${error.message}`,
        isSuccess: false
      });
    }
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
    return server.id === connectedServer?.id;
  };

  if (isFetching) {
    return <ProgressSpinner message="Fetching servers." />;
  }

  return (
    <>
      <Header>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <Typography
            style={{
              color: colors.infographic.primaryMossGreen,
              whiteSpace: "nowrap"
            }}
            bold={true}
          >
            Manage Connections
          </Typography>
          <StyledTextField
            id="serverSearch"
            value={filterByName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFilterByName(e.target.value)
            }
          />
          <CommonPanelContainer>
            <Switch
              checked={selectedFilter.filterPriorityServers}
              onChange={() => {
                setLocalStorageItem<boolean>(
                  STORAGE_FILTER_PRIORITYSERVERS_KEY,
                  !selectedFilter.filterPriorityServers
                );
                updateSelectedFilter({
                  filterPriorityServers: !selectedFilter.filterPriorityServers
                });
              }}
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <Typography
              style={{
                color: colors.infographic.primaryMossGreen,
                whiteSpace: "nowrap"
              }}
            >
              Only show priority servers
            </Typography>
          </CommonPanelContainer>
        </div>
        <Button
          variant="outlined"
          value={NEW_SERVER_ID}
          key={NEW_SERVER_ID}
          disabled={editDisabled || isError}
          onClick={() => onEditItem(emptyServer())}
        >
          <Icon name="cloudDownload" />
          New server
        </Button>
      </Header>
      <Table style={{ width: "100%" }} className="serversList">
        <Table.Head>
          <Table.Row>
            <Table.Cell style={CellHeaderStyle}>Server Name</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Server</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Username</Table.Cell>
            <Table.Cell style={CellHeaderStyle} />
            <Table.Cell style={CellHeaderStyle}>Status</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Priority</Table.Cell>
            <Table.Cell style={CellHeaderStyle}></Table.Cell>
            <Table.Cell style={CellHeaderStyle}></Table.Cell>
          </Table.Row>
        </Table.Head>
        <StyledTableBody colors={colors}>
          {(filteredServers ?? [])
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((server: Server) => (
              <Table.Row id={server.id} key={server.id}>
                <Table.Cell style={CellStyle}>
                  {isConnected(server) ? (
                    <StyledLink
                      onClick={() => navigate(getWellsViewPath(server.url))}
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
                    onClick={
                      isConnected(server)
                        ? () => disconnectServer()
                        : () => connectServer(server)
                    }
                  />
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button
                    variant="ghost"
                    disabled={editDisabled || isError}
                    onClick={() => togglePriority(server)}
                  >
                    <Icon
                      name={
                        server.isPriority
                          ? "favoriteFilled"
                          : "favoriteOutlined"
                      }
                      size={24}
                      color={colors.text.staticIconsTertiary}
                    />
                  </Button>
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button variant="ghost" onClick={() => onEditItem(server)}>
                    <Icon
                      name="edit"
                      size={24}
                      color={colors.text.staticIconsTertiary}
                    />
                  </Button>
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button
                    data-testid="deleteServerButton"
                    disabled={editDisabled || isError}
                    variant="ghost"
                    onClick={() =>
                      showDeleteServerModal(
                        server,
                        dispatchOperation,
                        connectedServer,
                        setConnectedServer,
                        queryClient
                      )
                    }
                  >
                    <Icon
                      name="deleteToTrash"
                      size={24}
                      color={colors.text.staticIconsTertiary}
                    />
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
  } = useOperationState();

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

const StyledTextField = styled(TextField)`
  div {
    background-color: transparent;
  }
  min-width: 220px;
`;

export default ServerManager;
