import {
  Icon,
  Label,
  Switch,
  TextField,
  Tooltip
} from "@equinor/eds-core-react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import ModalDialog, {
  ControlButtonPosition,
  ModalWidth
} from "components/Modals/ModalDialog";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  DisplayModalAction,
  HideModalAction,
  UserTheme
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { refreshServersQuery } from "hooks/query/queryRefreshHelpers";
import { useOperationState } from "hooks/useOperationState";
import { Server } from "models/server";
import { msalEnabled } from "msal/MsalAuthProvider";
import React, {
  CSSProperties,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useState
} from "react";
import AuthorizationService from "services/authorizationService";
import NotificationService from "services/notificationService";
import ServerService from "services/serverService";
import styled from "styled-components";
import Icons from "styles/Icons";

export interface ServerModalProps {
  server: Server;
  editDisabled: boolean;
}

const ServerModal = (props: ServerModalProps): React.ReactElement => {
  const queryClient = useQueryClient();
  const { operationState, dispatchOperation } = useOperationState();
  const { colors, theme } = operationState;
  const [server, setServer] = useState<Server>(props.server);
  const [connectionVerified, setConnectionVerified] = useState<boolean>(false);
  const [displayUrlError, setDisplayUrlError] = useState<boolean>(false);
  const [displayNameError, setDisplayServerNameError] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connectedServer, setConnectedServer } = useConnectedServer();

  const isAddingNewServer = props.server.id === undefined;
  const labelStyle: CSSProperties = {
    fontSize: "1rem",
    fontWeight: 500,
    color: colors.text.staticIconsDefault,
    paddingLeft: "0.9rem"
  };
  const onSubmit = async () => {
    const abortController = new AbortController();

    setIsLoading(true);
    try {
      if (isAddingNewServer) {
        const freshServer = await ServerService.addServer(
          server,
          abortController.signal
        );
        if (freshServer) refreshServersQuery(queryClient);
      } else {
        const freshServer = await ServerService.updateServer(
          server,
          abortController.signal
        );
        if (freshServer) {
          refreshServersQuery(queryClient);
          AuthorizationService.onServerStateChange(server);
        }
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
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const showDeleteModal = () => {
    dispatchOperation({ type: OperationType.HideModal });
    showDeleteServerModal(
      server,
      dispatchOperation,
      connectedServer,
      setConnectedServer,
      queryClient
    );
  };

  const runServerNameValidation = () => {
    setDisplayServerNameError(server.name.length === 0);
  };

  const runUrlValidation = () => {
    setDisplayUrlError(!isUrlValid(server.url));
  };

  const validateForm = () => {
    return (
      server.name.length !== 0 &&
      isUrlValid(server.url) &&
      !isNaN(server.depthLogDecimals)
    );
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
          <ContentWrapper>
            <Label label="Server URL" style={labelStyle} htmlFor="serverUrl" />
            <TextField
              id="serverUrl"
              defaultValue={server.url}
              variant={displayUrlError ? "error" : null}
              helperText={displayUrlError ? "Not a valid server url" : ""}
              onChange={onChangeUrl}
              onBlur={runUrlValidation}
              required
              disabled={props.editDisabled}
            />
            <Label
              label="Server name"
              style={labelStyle}
              htmlFor="serverName"
            />
            <TextField
              id="serverName"
              defaultValue={server.name}
              variant={displayNameError ? "error" : null}
              helperText={
                displayNameError
                  ? "A server name must have 1-64 characters"
                  : ""
              }
              onBlur={runServerNameValidation}
              onChange={onChangeName}
              required
              disabled={props.editDisabled}
            />
            <Label
              label="Server description"
              style={labelStyle}
              htmlFor="description"
            />
            <TextField
              id="description"
              defaultValue={server.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setServer({ ...server, description: e.target.value })
              }
              disabled={props.editDisabled}
            />
            {msalEnabled && (
              <>
                <Label
                  label="Roles (space delimited)"
                  style={labelStyle}
                  htmlFor="role"
                />
                <TextField
                  id="role"
                  defaultValue={server.roles?.join(" ")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setServer({
                      ...server,
                      roles: e.target.value
                        .split(" ")
                        .filter((role: string) => role.trim() !== "")
                    })
                  }
                  disabled={props.editDisabled}
                />
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Label
                    label="Credential Ids"
                    style={labelStyle}
                    htmlFor="creds"
                  />
                  <Tooltip title="If this (space delimited) field is set, the server will use the credentials with the given ids to authenticate. Otherwise, the server will use the Server URL to find the credentials.">
                    <Icon
                      name="infoCircle"
                      color={colors.interactive.primaryResting}
                      size={18}
                    />
                  </Tooltip>
                </div>
                <TextField
                  id="creds"
                  defaultValue={server.credentialIds?.join(" ") ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setServer({
                      ...server,
                      credentialIds: e.target.value
                        .split(" ")
                        .filter((id: string) => id.trim() !== "")
                    })
                  }
                  disabled={props.editDisabled}
                />
              </>
            )}
            <Label
              label="Number of decimals in depth log index"
              style={labelStyle}
              htmlFor="depthLogDecimals"
            />
            <TextField
              id="depthLogDecimals"
              defaultValue={server.depthLogDecimals}
              variant={isNaN(server.depthLogDecimals) ? "error" : null}
              helperText={
                isNaN(server.depthLogDecimals)
                  ? "Depth log decimals must be a valid positive integer"
                  : ""
              }
              type="number"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setServer({
                  ...server,
                  depthLogDecimals: parseInt(e.target.value)
                })
              }
              disabled={props.editDisabled}
            />
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Label label="Priority" style={labelStyle} htmlFor="isPriority" />
              <Tooltip title="Marking a server as a priority allows you to filter and only display these servers throughout the application.">
                <Icon
                  name="infoCircle"
                  color={colors.interactive.primaryResting}
                  size={18}
                />
              </Tooltip>
            </div>
            <Switch
              id="isPriority"
              style={{ maxWidth: "fit-content" }}
              checked={server.isPriority}
              onChange={() =>
                setServer({
                  ...server,
                  isPriority: !server.isPriority
                })
              }
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <ButtonWrapper>
              {connectionVerified && (
                <Icons
                  name="done"
                  color={colors.interactive.primaryResting}
                  size={32}
                />
              )}
              <Button
                disabled={displayUrlError || connectionVerified}
                onClick={showCredentialsModal}
                variant="outlined"
              >
                {"Test connection"}
              </Button>
            </ButtonWrapper>
          </ContentWrapper>
        </>
      }
      onSubmit={onSubmit}
      isLoading={isLoading}
      onDelete={server.id && !props.editDisabled ? showDeleteModal : null}
      buttonPosition={ControlButtonPosition.TOP}
      confirmDisabled={props.editDisabled || !validateForm()}
      width={ModalWidth.LARGE}
    />
  );
};

export const showDeleteServerModal = (
  server: Server,
  dispatchOperation: (action: HideModalAction | DisplayModalAction) => void,
  connectedServer: Server,
  setConnectedServer: Dispatch<SetStateAction<Server>>,
  queryClient: QueryClient
) => {
  const onCancel = () => {
    dispatchOperation({ type: OperationType.HideModal });
  };
  const onConfirm = async () => {
    const abortController = new AbortController();
    try {
      await ServerService.removeServer(server.id, abortController.signal);
      if (server.id === connectedServer?.id) {
        setConnectedServer(null);
      }
      refreshServersQuery(queryClient);
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
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmModal
  });
};

const isUrlValid = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 12em 1fr;
  align-items: center;
  margin: 0.5rem 6rem 0.75rem 2.5rem;
  row-gap: 1.5rem;
`;

const ButtonWrapper = styled.div`
  grid-column: 2/3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export default ServerModal;
