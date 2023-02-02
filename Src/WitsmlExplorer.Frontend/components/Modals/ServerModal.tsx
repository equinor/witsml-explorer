import { Button, TextField } from "@material-ui/core";
import MuiThumbUpOutlinedIcon from "@material-ui/icons/ThumbUpOutlined";
import React, { ChangeEvent, useContext, useState } from "react";
import styled from "styled-components";
import { RemoveWitsmlServerAction } from "../../contexts/modificationActions";
import ModificationType from "../../contexts/modificationType";
import { SelectServerAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import { DisplayModalAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import { msalEnabled } from "../../msal/MsalAuthProvider";
import NotificationService from "../../services/notificationService";
import ServerService from "../../services/serverService";
import { colors } from "../../styles/Colors";
import ModalDialog from "./ModalDialog";
import UserCredentialsModal, { UserCredentialsModalProps } from "./UserCredentialsModal";

export interface ServerModalProps {
  server: Server;
  editDisabled: boolean;
}

const ServerModal = (props: ServerModalProps): React.ReactElement => {
  const {
    navigationState: { selectedServer },
    dispatchNavigation
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const [server, setServer] = useState<Server>(props.server);
  const [connectionVerified, setConnectionVerified] = useState<boolean>(false);
  const [displayUrlError, setDisplayUrlError] = useState<boolean>(false);
  const [displayNameError, setDisplayServerNameError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAddingNewServer = props.server.id === undefined;

  const onSubmit = async () => {
    const abortController = new AbortController();

    setIsLoading(true);
    try {
      if (isAddingNewServer) {
        const freshServer = await ServerService.addServer(server, abortController.signal);
        dispatchNavigation({ type: ModificationType.AddServer, payload: { server: freshServer } });
      } else {
        const freshServer = await ServerService.updateServer(server, abortController.signal);
        dispatchNavigation({ type: ModificationType.UpdateServer, payload: { server: freshServer } });
      }
    } catch (error) {
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: null,
        message: error.message,
        isSuccess: false
      });
    } finally {
      setIsLoading(false);
      dispatchOperation({ type: OperationType.HideModal });
    }
  };

  const showCredentialsModal = () => {
    const onVerifyConnection = () => {
      setConnectionVerified(true);
      dispatchOperation({ type: OperationType.HideModal });
    };

    const userCredentialsModalProps: UserCredentialsModalProps = {
      server,
      confirmText: "Test",
      onConnectionVerified: onVerifyConnection
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  const showDeleteModal = () => {
    dispatchOperation({ type: OperationType.HideModal });
    showDeleteServerModal(server, dispatchOperation, dispatchNavigation, selectedServer);
  };

  const runServerNameValidation = () => {
    setDisplayServerNameError(server.name.length === 0);
  };

  const runUrlValidation = () => {
    setDisplayUrlError(!isUrlValid(server.url));
  };

  const validateForm = () => {
    return server.name.length !== 0 && isUrlValid(server.url);
  };

  const onChangeUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setConnectionVerified(false);
    if (displayUrlError) {
      runUrlValidation();
    }
    setServer({ ...server, url: e.target.value });
  };

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    if (displayNameError) {
      runServerNameValidation();
    }
    setServer({ ...server, name: e.target.value });
  };

  return (
    <ModalDialog
      heading={`${isAddingNewServer ? "Add" : "Edit"} server`}
      content={
        <>
          <ServerAndButton>
            <TextField
              id="url"
              label="Server URL"
              defaultValue={server.url}
              error={displayUrlError}
              helperText={displayUrlError ? "Not a valid server url" : ""}
              fullWidth
              inputProps={{ maxLength: 256 }}
              onChange={onChangeUrl}
              onBlur={runUrlValidation}
              required
              disabled={props.editDisabled}
            />
            {connectionVerified && <ThumbUpOutlinedIcon style={{ color: colors.interactive.successResting }} variant={"outlined"} fontSize={"large"} />}
            <TestServerButton disabled={displayUrlError || connectionVerified} onClick={showCredentialsModal} color={"primary"} variant="outlined">
              {"Test connection"}
            </TestServerButton>
          </ServerAndButton>
          <TextField
            id="name"
            label="Server name"
            defaultValue={server.name}
            error={displayNameError}
            helperText={displayNameError ? "A server name must have 1-64 characters" : ""}
            fullWidth
            inputProps={{ minLength: 1, maxLength: 64 }}
            onBlur={runServerNameValidation}
            onChange={onChangeName}
            required
            disabled={props.editDisabled}
          />
          <TextField
            id="description"
            label="Server description"
            defaultValue={server.description}
            fullWidth
            inputProps={{ maxLength: 64 }}
            onChange={(e) => setServer({ ...server, description: e.target.value })}
            disabled={props.editDisabled}
          />
          {msalEnabled && (
            <TextField
              id="role"
              label="Roles (space delimited)"
              defaultValue={server.roles?.join(" ")}
              fullWidth
              inputProps={{ maxLength: 64 }}
              onChange={(e) => setServer({ ...server, roles: e.target.value.split(" ") })}
              disabled={props.editDisabled}
            />
          )}
        </>
      }
      onSubmit={onSubmit}
      isLoading={isLoading}
      onDelete={server.id && !props.editDisabled ? showDeleteModal : null}
      confirmDisabled={props.editDisabled || !validateForm()}
    />
  );
};

export const showDeleteServerModal = (
  server: Server,
  dispatchOperation: (action: HideModalAction | DisplayModalAction) => void,
  dispatchNavigation: (action: SelectServerAction | RemoveWitsmlServerAction) => void,
  selectedServer: Server
) => {
  const onCancel = () => {
    dispatchOperation({ type: OperationType.HideModal });
  };
  const onConfirm = async () => {
    const abortController = new AbortController();
    try {
      await ServerService.removeServer(server.id, abortController.signal);
      dispatchNavigation({ type: ModificationType.RemoveServer, payload: { serverUid: server.id } });
      if (server.id === selectedServer?.id) {
        const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: null } };
        dispatchNavigation(action);
      }
    } catch (error) {
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: new URL(server.url),
        message: error.message,
        isSuccess: false
      });
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

const isUrlValid = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ServerAndButton = styled.div`
  display: flex;
`;

const TestServerButton = styled(Button)`
  && {
    margin-left: 1em;
  }
  flex: 1 0 auto;
`;

const ThumbUpOutlinedIcon = styled(MuiThumbUpOutlinedIcon)<{ variant: string }>`
  && {
    height: 1.5em;
  }
`;

export default ServerModal;
