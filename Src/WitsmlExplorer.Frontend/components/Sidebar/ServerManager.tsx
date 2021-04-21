import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Divider, FormControl as MuiFormControl, FormHelperText, InputLabel, Link, ListItemIcon, ListItemSecondaryAction, MenuItem, Select, Typography } from "@material-ui/core";
import NavigationContext from "../../contexts/navigationContext";
import { emptyServer, Server } from "../../models/server";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ServerModal, { ServerModalProps } from "../Modals/ServerModal";
import ServerService from "../../services/serverService";
import { EditIcon, NewIcon } from "../Icons";
import NavigationType from "../../contexts/navigationType";
import CredentialsService from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import IdleTimer from "react-idle-timer";
import WellService from "../../services/wellService";
import ModificationType from "../../contexts/modificationType";
import { SelectServerAction, UpdateServerListAction } from "../../contexts/navigationStateReducer";

const NEW_SERVER_ID = "1";
const IDLE_TIMEOUT = 1000 * 60 * 10;

const ServerManager = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, servers, wells } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isOpen, setIsOpen] = useState<boolean>();
  const [currentLoginState, setLoginState] = useState<{ isLoggedIn: boolean; username?: string; server?: Server }>({ isLoggedIn: false });

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
      if (currentLoginState.server) {
        const isLoggedInToSelectedServer = currentLoginState.isLoggedIn && currentLoginState.server.id === selectedServer?.id;
        if (isLoggedInToSelectedServer) {
          try {
            const hasWells = wells.length > 0;
            if (!hasWells) {
              const wells = await WellService.getWells();
              dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
            }
            dispatchOperation({ type: OperationType.HideModal });
          } catch (error) {
            showCredentialsModal(currentLoginState.server, error.message);
          }
        } else {
          showCredentialsModal(currentLoginState.server);
        }
      }
    };
    onCurrentLoginStateChange();
  }, [currentLoginState]);

  useEffect(() => {
    const abortController = new AbortController();
    const getServers = async () => {
      const freshServers = await ServerService.getServers(abortController.signal);
      const action: UpdateServerListAction = { type: ModificationType.UpdateServerList, payload: { servers: freshServers } };
      dispatchNavigation(action);
    };
    getServers();

    return () => {
      abortController.abort();
    };
  }, []);

  const onSelectItem = async (server: Server) => {
    if (server.id === NEW_SERVER_ID) {
      onEditItem(emptyServer());
    } else {
      const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server } };
      dispatchNavigation(action);
      CredentialsService.setSelectedServer(server);
    }
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
    if (!selectedServer?.id) {
      return <FormHelperText>No server selected</FormHelperText>;
    } else {
      if (currentLoginState.isLoggedIn) {
        return (
          <FormHelperText>
            Connected user: <LinkButton onClick={() => showCredentialsModal(selectedServer)}>{currentLoginState.username}</LinkButton>
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
    if (selectedServer?.id) {
      CredentialsService.clearPasswords();
      showCredentialsModal(selectedServer);
    }
  };

  return (
    <>
      <IdleTimer onIdle={onIdle} timeout={IDLE_TIMEOUT} />
      <FormControl>
        <InputLabel id="servers-label">Server</InputLabel>
        <Select labelId="servers-label" value={selectedServer?.id ?? ""} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
          {servers.map((server: Server) => (
            <MenuItem value={server.id} key={server.id} onClick={() => onSelectItem(server)}>
              <Typography color={"initial"}>{server.name}</Typography>
              {isOpen && (
                <ListItemSecondaryAction onClick={() => onEditItem(server)}>
                  <EditIcon />
                </ListItemSecondaryAction>
              )}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem value={NEW_SERVER_ID} key={NEW_SERVER_ID}>
            <ListItemIcon>
              <NewIcon />
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
