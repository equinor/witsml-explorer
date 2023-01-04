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
import { Server, emptyServer } from "../../models/server";
import { SecurityScheme, getUserAppRoles, msalEnabled } from "../../msal/MsalAuthProvider";
import CredentialsService from "../../services/credentialsService";
import NotificationService from "../../services/notificationService";
import ServerService from "../../services/serverService";
import WellService from "../../services/wellService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import ModalDialog from "../Modals/ModalDialog";
import ServerModal, { ServerModalProps } from "../Modals/ServerModal";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
const NEW_SERVER_ID = "1";

const ServerManager = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, servers, wells } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [hasFetchedServers, setHasFetchedServers] = useState(false);
  const [currentWitsmlLoginState, setLoginState] = useState<{ isLoggedIn: boolean; username?: string; server?: Server }>({ isLoggedIn: false });

  useEffect(() => {
    const unsubscribeFromCredentialsEvents = CredentialsService.onCredentialStateChanged.subscribe(async (credentialState) => {
      setLoginState({ isLoggedIn: credentialState.hasPassword, username: CredentialsService.getCredentials()[0]?.username, server: credentialState.server });
    });
    return () => {
      unsubscribeFromCredentialsEvents();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const onCurrentLoginStateChange = async () => {
      const fetchWells = async () => {
        if (wells.length === 0) {
          const wells = await WellService.getWells();
          dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
        }
      };
      const useOauth = msalEnabled && selectedServer?.securityscheme == SecurityScheme.OAuth2 && getUserAppRoles().some((x) => selectedServer.roles.includes(x));
      if (useOauth) {
        try {
          await fetchWells();
        } catch (error) {
          NotificationService.Instance.alertDispatcher.dispatch({
            serverUrl: new URL(selectedServer.url),
            message: error.message,
            isSuccess: false
          });
        }
      } else if (currentWitsmlLoginState.server) {
        if (CredentialsService.isAuthorizedForServer(selectedServer)) {
          try {
            await fetchWells();
            dispatchOperation({ type: OperationType.HideModal });
          } catch (error) {
            showCredentialsModal(currentWitsmlLoginState.server, error.message);
          }
        } else {
          showCredentialsModal(currentWitsmlLoginState.server);
          const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: currentWitsmlLoginState.server } };
          dispatchNavigation(action);
        }
      }
    };
    onCurrentLoginStateChange();
    return () => {
      abortController.abort();
    };
  }, [msalEnabled, currentWitsmlLoginState]);

  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  useEffect(() => {
    if (isAuthenticated && !hasFetchedServers) {
      const abortController = new AbortController();
      const getServers = async () => {
        const freshServers = await ServerService.getServers(abortController.signal);
        setHasFetchedServers(true);
        CredentialsService.saveServers(freshServers);
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
    if (server.id === selectedServer?.id) {
      await CredentialsService.deauthorize();
      CredentialsService.setSelectedServer(null);
      setHasFetchedServers(false);
      const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: null } };
      dispatchNavigation(action);
    } else {
      const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server } };
      dispatchNavigation(action);
      CredentialsService.setSelectedServer(server);
    }
    const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: null } };
    dispatchNavigation(action);
  };

  const onEditItem = (server: Server) => {
    const modalProps: ServerModalProps = { server, dispatchNavigation, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <ServerModal {...modalProps} /> });
  };

  const showCredentialsModal = (server: Server, errorMessage = "") => {
    const currentCredentials = CredentialsService.getCredentials()[0];
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: server,
      serverCredentials: currentCredentials,
      mode: CredentialsMode.SAVE,
      errorMessage
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  const showDeleteModal = (server: Server) => {
    const onCancel = () => {
      dispatchOperation({ type: OperationType.HideModal });
    };
    const onConfirm = async () => {
      const abortController = new AbortController();
      try {
        await ServerService.removeServer(server.id, abortController.signal);
        dispatchNavigation({ type: ModificationType.RemoveServer, payload: { serverUid: server.id } });
        if (server.id === selectedServer?.id) {
          await CredentialsService.deauthorize();
          const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: null } };
          dispatchNavigation(action);
          CredentialsService.setSelectedServer(null);
        }
      } catch (error) {
        //TODO Add a commmon way to handle such errors.
      } finally {
        dispatchOperation({ type: OperationType.HideModal });
      }
    };
    const confirmModal = (
      <ModalDialog
        heading={`Remove the server "${server.name}"?`}
        content={<>Removing a server will permanently remove it from the list.</>}
        confirmColor={"danger"}
        confirmText={"Remove server"}
        onCancel={onCancel}
        onSubmit={onConfirm}
        isLoading={false}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmModal });
  };
  const CellHeaderStyle = {
    color: colors.interactive.primaryResting,
    padding: "0.3rem"
  };
  const CellHeader = {
    color: colors.interactive.primaryResting,
    display: "flex",
    justifyContent: "center",
    height: "100%",
    padding: "0.3rem"
  };
  return (
    <>
      <Header>
        <Typography color={"primary"} bold={true}>
          Manage Connections
        </Typography>
        <Button variant="outlined" value={NEW_SERVER_ID} key={NEW_SERVER_ID} onClick={() => onEditItem(emptyServer())}>
          <Icon name="cloudDownload" />
          New server
        </Button>
      </Header>
      <Table style={{ width: "100%" }} className="serversList">
        <Table.Head>
          <Table.Row>
            <Table.Cell style={CellHeaderStyle}>Server Name</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Server</Table.Cell>
            <Table.Cell style={CellHeader}>Test Connection</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Status</Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {servers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((server: Server) => (
              <Table.Row id={server.id} key={server.id}>
                <Table.Cell style={CellHeaderStyle}>{server.name}</Table.Cell>
                <Table.Cell style={CellHeaderStyle}>{server.url}</Table.Cell>
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
                  <Button variant="ghost" onClick={() => showDeleteModal(server)}>
                    <Icon name="deleteToTrash" size={24} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
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

export default ServerManager;