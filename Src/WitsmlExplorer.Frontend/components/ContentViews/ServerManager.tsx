import { useIsAuthenticated } from "@azure/msal-react";
import { Button, Table, Typography } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { UpdateServerListAction } from "../../contexts/modificationActions";
import ModificationType from "../../contexts/modificationType";
import { SelectServerAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { emptyServer, Server } from "../../models/server";
import { adminRole, getUserAppRoles, msalEnabled } from "../../msal/MsalAuthProvider";
import AuthorizationService, { AuthorizationState, AuthorizationStatus } from "../../services/credentialsService";
import NotificationService from "../../services/notificationService";
import ServerService from "../../services/serverService";
import WellService from "../../services/wellService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import ServerModal, { showDeleteServerModal } from "../Modals/ServerModal";

const NEW_SERVER_ID = "1";

const ServerManager = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, servers, wells } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [hasFetchedServers, setHasFetchedServers] = useState(false);
  const editDisabled = msalEnabled && !getUserAppRoles().includes(adminRole);
  const [authorizationState, setAuthorizationState] = useState<AuthorizationState>();

  useEffect(() => {
    const unsubscribeFromCredentialsEvents = AuthorizationService.onAuthorizationChangeEvent.subscribe(async (authorizationState) => {
      setAuthorizationState(authorizationState);
    });
    return () => {
      unsubscribeFromCredentialsEvents();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const onCurrentLoginStateChange = async () => {
      if (selectedServer == null || wells.length !== 0 || (authorizationState && authorizationState.status != AuthorizationStatus.Authorized)) {
        return;
      }
      try {
        const wells = await WellService.getWells();
        dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
      } catch (error) {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(selectedServer.url),
          message: error.message,
          isSuccess: false
        });
        dispatchNavigation({ type: NavigationType.SelectServer, payload: { server: null } });
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
        const freshServers = await ServerService.getServers(abortController.signal);
        setHasFetchedServers(true);
        const action: UpdateServerListAction = { type: ModificationType.UpdateServerList, payload: { servers: freshServers } };
        dispatchNavigation(action);
      };
      getServers();

      return () => {
        abortController.abort();
      };
    }
  }, [isAuthenticated, hasFetchedServers]);

  const onSelectItem = async (server: Server) => {
    const currentServer = server.id === selectedServer?.id ? null : server;
    const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: currentServer } };
    dispatchNavigation(action);
  };

  const onEditItem = (server: Server) => {
    dispatchOperation({ type: OperationType.DisplayModal, payload: <ServerModal editDisabled={editDisabled} server={server} /> });
  };

  const CellHeaderStyle = {
    color: colors.interactive.primaryResting,
    padding: "0.3rem"
  };

  return (
    <>
      <Header>
        <Typography color={"primary"} bold={true}>
          Manage Connections
        </Typography>
        <Button variant="outlined" value={NEW_SERVER_ID} key={NEW_SERVER_ID} disabled={editDisabled} onClick={() => onEditItem(emptyServer())}>
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
            <Table.Cell />
            <Table.Cell style={CellHeaderStyle}>Status</Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
        </Table.Head>
        <StyledTableBody>
          {servers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((server: Server) => (
              <Table.Row id={server.id} key={server.id}>
                <Table.Cell style={CellHeaderStyle}>{server.name}</Table.Cell>
                <Table.Cell style={CellHeaderStyle}>{server.url}</Table.Cell>
                <Table.Cell style={CellHeaderStyle}>{server.username}</Table.Cell>
                <Table.Cell style={{ textAlign: "center" }}>
                  <Icon color={selectedServer?.id == server.id && wells.length ? colors.interactive.successResting : colors.text.staticIconsTertiary} name="cloudDownload" />
                </Table.Cell>
                <Table.Cell style={CellHeaderStyle}>
                  <CustomButton
                    variant="outlined"
                    onClick={() => onSelectItem(server)}
                    style={{
                      color: selectedServer?.id == server.id && wells.length ? colors.interactive.primaryResting : colors.text.staticIconsDefault,
                      borderColor: selectedServer?.id == server.id && wells.length ? colors.interactive.successResting : colors.text.staticIconsDefault
                    }}
                  >
                    {selectedServer?.id == server.id && wells.length ? "Connected" : "Connect"}
                  </CustomButton>
                </Table.Cell>
                <Table.Cell style={CellHeaderStyle}>
                  <Button variant="ghost" onClick={() => onEditItem(server)}>
                    <Icon name="edit" size={24} />
                  </Button>
                </Table.Cell>
                <Table.Cell style={CellHeaderStyle}>
                  <Button disabled={editDisabled} variant="ghost" onClick={() => showDeleteServerModal(server, dispatchOperation, dispatchNavigation, selectedServer)}>
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

const CustomButton = styled(Button)`
  border-radius: 20px;
  width: 5.75rem;
  height: 1.5rem;
  border-color: ${colors.interactive.successResting};
  &:hover {
    border-radius: 20px;
  }
`;

const StyledTableBody = styled(Table.Body)`
  tr:nth-child(even) {
    background-color: ${colors.interactive.tableHeaderFillResting};
  }

  tr:nth-child(odd) {
    background-color: white;
  }
`;

export default ServerManager;
