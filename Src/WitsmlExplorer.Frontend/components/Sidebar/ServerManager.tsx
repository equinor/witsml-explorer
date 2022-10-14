import { useIsAuthenticated } from "@azure/msal-react";
import { Typography } from "@equinor/eds-core-react";
import { Divider, FormControl as MuiFormControl, FormHelperText, InputLabel, Link, ListItemIcon, ListItemSecondaryAction, MenuItem, Select } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import styled from "styled-components";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import { SelectServerAction, UpdateServerListAction } from "../../contexts/navigationStateReducer";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { emptyServer, Server } from "../../models/server";
import { getUserAppRoles, msalEnabled, SecurityScheme } from "../../msal/MsalAuthProvider";
import CredentialsService from "../../services/credentialsService";
import NotificationService from "../../services/notificationService";
import ServerService from "../../services/serverService";
import WellService from "../../services/wellService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import ServerModal, { ServerModalProps } from "../Modals/ServerModal";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

const NEW_SERVER_ID = "1";
const IDLE_TIMEOUT = 1000 * 60 * 10;

const ServerManager = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, servers, wells } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isOpen, setIsOpen] = useState<boolean>();
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
    const onCurrentLoginStateChange = async () => {
      if (msalEnabled && selectedServer?.securityscheme == SecurityScheme.OAuth2 && getUserAppRoles().some((x) => selectedServer.roles.includes(x))) {
        try {
          if (wells.length === 0) {
            const wells = await WellService.getWells();
            dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
          }
        } catch (error) {
          NotificationService.Instance.alertDispatcher.dispatch({
            serverUrl: new URL(selectedServer.url),
            message: error.message,
            isSuccess: false
          });
        }
      } else if (currentWitsmlLoginState.server) {
        const isLoggedInToSelectedServer = CredentialsService.isAuthorizedForServer(selectedServer);
        if (isLoggedInToSelectedServer) {
          try {
            const hasWells = wells.length > 0;
            if (!hasWells) {
              const wells = await WellService.getWells();
              dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
            }
            dispatchOperation({ type: OperationType.HideModal });
          } catch (error) {
            showCredentialsModal(currentWitsmlLoginState.server, error.message);
          }
        } else {
          showCredentialsModal(currentWitsmlLoginState.server);
        }
      }
    };
    onCurrentLoginStateChange();
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
  }, [isAuthenticated]);

  const onSelectItem = async (server: Server) => {
    const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server } };
    dispatchNavigation(action);
    CredentialsService.setSelectedServer(server);
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

  const AuthenticationState = () => {
    if (msalEnabled) return;
    if (!selectedServer?.id) {
      return <FormHelperText>No server selected</FormHelperText>;
    } else {
      if (currentWitsmlLoginState.isLoggedIn) {
        return (
          <FormHelperText>
            Connected user: <LinkButton onClick={() => showCredentialsModal(selectedServer)}>{currentWitsmlLoginState.username}</LinkButton>
          </FormHelperText>
        );
      } else {
        return (
          <FormHelperText>
            <LinkButton onClick={() => showCredentialsModal(selectedServer)}>Not logged in</LinkButton>
          </FormHelperText>
        );
      }
    }
  };

  const onIdle = () => {
    if (!msalEnabled && selectedServer?.id) {
      CredentialsService.clearPasswords();
      showCredentialsModal(selectedServer);
    }
  };

  useIdleTimer({ onIdle: onIdle, timeout: IDLE_TIMEOUT });

  return (
    <>
      <FormControl>
        <InputLabel id="servers-label">Server</InputLabel>
        <Select labelId="servers-label" value={selectedServer?.id ?? ""} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
          {servers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((server: Server) => (
              <MenuItem value={server.id} key={server.id} onClick={() => onSelectItem(server)}>
                <Typography style={{ marginRight: 20 * +isOpen, overflow: "hidden" }} color={"initial"}>
                  {server.name}
                </Typography>
                {isOpen && (
                  <ListItemSecondaryAction onClick={() => onEditItem(server)}>
                    <Icon name="edit" color={colors.interactive.primaryResting} />
                  </ListItemSecondaryAction>
                )}
              </MenuItem>
            ))}
          <Divider />
          <MenuItem value={NEW_SERVER_ID} key={NEW_SERVER_ID} onClick={() => onEditItem(emptyServer())}>
            <ListItemIcon>
              <Icon name="add" color={colors.interactive.primaryResting} />
            </ListItemIcon>
            <Typography color={"initial"}>Add server</Typography>
          </MenuItem>
        </Select>
        <AuthenticationState />
      </FormControl>
    </>
  );
};

const FormControl = styled(MuiFormControl)`
  && {
    margin-left: 0.5rem;
  }
`;

const LinkButton = styled(Link)`
  & {
    cursor: pointer;
  }
`;

export default ServerManager;
