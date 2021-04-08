import React, { ChangeEvent, useState } from "react";
import ModalDialog from "./ModalDialog";
import { Button, TextField } from "@material-ui/core";
import styled from "styled-components";
import { Server } from "../../models/server";
import ServerService from "../../services/serverService";
import OperationType from "../../contexts/operationType";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "./UserCredentialsModal";
import { ServerCredentials } from "../../services/credentialsService";
import MuiThumbUpOutlinedIcon from "@material-ui/icons/ThumbUpOutlined";
import { colors } from "../../styles/Colors";
import ModificationType from "../../contexts/modificationType";
import { AddServerAction, RemoveWitsmlServerAction, UpdateServerAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideModalAction } from "../../contexts/operationStateReducer";

export interface ServerModalProps {
  server: Server;
  dispatchNavigation: (action: AddServerAction | UpdateServerAction | RemoveWitsmlServerAction) => void;
  dispatchOperation: (action: HideModalAction | DisplayModalAction) => void;
  connectionVerified?: boolean;
}

const ServerModal = (props: ServerModalProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation } = props;
  const [server, setServer] = useState<Server>(props.server);
  const [connectionVerified, setConnectionVerified] = useState<boolean>(props.connectionVerified ?? false);
  const [displayUrlError, setDisplayUrlError] = useState<boolean>(false);
  const [displayNameError, setDisplayServerNameError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAddingNewServer = props.server.id === undefined;

  const onSubmit = async () => {
    const abortController = new AbortController();

    setIsLoading(true);
    if (isAddingNewServer) {
      const freshServer = await ServerService.addServer(server, abortController.signal);
      dispatchNavigation({ type: ModificationType.AddServer, payload: { server: freshServer } });
    } else {
      const freshServer = await ServerService.updateServer(server, abortController.signal);
      dispatchNavigation({ type: ModificationType.UpdateServer, payload: { server: freshServer } });
    }
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const showCredentialsModal = () => {
    const onCancel = () => {
      const modalProps: ServerModalProps = { server, dispatchNavigation, dispatchOperation };
      dispatchOperation({ type: OperationType.DisplayModal, payload: <ServerModal {...modalProps} /> });
    };

    const onVerifyConnection = () => {
      const modalProps: ServerModalProps = { server, dispatchNavigation, dispatchOperation, connectionVerified: true };
      dispatchOperation({ type: OperationType.DisplayModal, payload: <ServerModal {...modalProps} /> });
    };

    const serverCredentials: ServerCredentials = { username: "", password: "", server };
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server,
      serverCredentials,
      mode: CredentialsMode.TEST,
      errorMessage: "",
      onCancel: onCancel,
      onConnectionVerified: onVerifyConnection
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  // Uncomment to enable user edit of server list
  const showDeleteModal = () => {
    const onCancel = () => {
      const modalProps: ServerModalProps = { server, dispatchNavigation, dispatchOperation };
      dispatchOperation({ type: OperationType.DisplayModal, payload: <ServerModal {...modalProps} /> });
    };

    const onConfirm = async () => {
      const abortController = new AbortController();

      try {
        await ServerService.removeServer(server.id, abortController.signal);
        dispatchNavigation({ type: ModificationType.RemoveServer, payload: { serverUid: server.id } });
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
        confirmColor={"secondary"}
        confirmText={"Remove server"}
        onCancel={onCancel}
        onSubmit={onConfirm}
        isLoading={isLoading}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmModal });
  };

  const runServerNameValidation = () => {
    setDisplayServerNameError(server.name.length === 0);
  };

  const runUrlValidation = () => {
    setDisplayUrlError(!isUrlValid(server.url));
  };

  // Uncomment to enable user edit of server list
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
          />
          <TextField
            id="description"
            label="Server description"
            defaultValue={server.description}
            fullWidth
            inputProps={{ maxLength: 64 }}
            onChange={(e) => setServer({ ...server, description: e.target.value })}
          />
        </>
      }
      onSubmit={onSubmit}
      isLoading={isLoading}
      onDelete={server.id ? showDeleteModal : null}
      confirmDisabled={!validateForm()}
    />
  );
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
