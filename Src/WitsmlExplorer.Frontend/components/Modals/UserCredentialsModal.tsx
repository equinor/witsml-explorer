import {
  Autocomplete,
  Progress,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { validText } from "components/Modals/ModalParts";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { Server } from "models/server";
import React, { ChangeEvent, useEffect, useState } from "react";
import AuthorizationService, {
  AuthorizationStatus,
  BasicServerCredentials,
  ConnectionInformation
} from "services/authorizationService";
import styled from "styled-components";

export interface UserCredentialsModalProps {
  server: Server;
  errorMessage?: string;
  onConnectionVerified?: (username?: string) => void;
  onCancel?: () => void;
  confirmText?: string;
}

const UserCredentialsModal = (
  props: UserCredentialsModalProps
): React.ReactElement => {
  const { server, confirmText } = props;
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const shouldFocusPasswordInput = !!username;
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(
    AuthorizationService.getKeepLoggedInToServer(server.url)
  );

  const getInitialUsername = (): string => {
    if (server.usernames == null || server.usernames.length == 0) {
      return null;
    } else if (
      server.usernames.length > 1 &&
      server.usernames[0] == server.currentUsername
    ) {
      return server.usernames[1];
    }
    return server.usernames[0];
  };
  const [selectedUsername, setSelectedUsername] = useState<string>(
    getInitialUsername()
  );

  useEffect(() => {
    if (server.currentUsername) {
      setUsername(server.currentUsername);
    }
  }, [server]);

  useEffect(() => {
    if (props.errorMessage !== "") {
      setErrorMessage(props.errorMessage);
      setIsLoading(false);
    }
  }, [props]);

  const onVerifyConnection = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const credentials: BasicServerCredentials = {
      server,
      username,
      password
    };
    try {
      await AuthorizationService.verifyCredentials(credentials, keepLoggedIn);
      props.onConnectionVerified(username);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <ModalDialog
      heading={`Access server`}
      content={
        <>
          <Typography style={{ marginBottom: 20 }}>{server.name}</Typography>
          <TextField
            autoFocus={!shouldFocusPasswordInput}
            id={"username" + server.id}
            label={"Username"}
            defaultValue={username}
            required
            variant={username?.length === 0 ? "error" : undefined}
            helperText={
              username?.length === 0 ? "Username must be 1-7936 characters" : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            style={{ marginBottom: 15, color: colors.text.staticIconsDefault }}
          />
          <TextField
            autoFocus={shouldFocusPasswordInput}
            id={"password" + server.id}
            label={"Password"}
            defaultValue={password}
            variant={password?.length === 0 ? "error" : undefined}
            helperText={
              password?.length === 0 ? "Password must be 1-7936 characters" : ""
            }
            type="password"
            autoComplete="current-password"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            style={{ color: colors.text.staticIconsDefault }}
          />
          {server.usernames && server.usernames.length > 0 && (
            <Row>
              <Autocomplete
                style={{ color: colors.text.staticIconsDefault }}
                label="Switch to an already logged in user"
                initialSelectedOptions={[selectedUsername]}
                options={server.usernames}
                hideClearButton={true}
                onOptionsChange={({ selectedItems }) => {
                  setSelectedUsername(selectedItems[0]);
                }}
              />
              <Button
                disabled={isSwitchingUser}
                onClick={async () => {
                  try {
                    setIsSwitchingUser(true);
                    const connectionInfo: ConnectionInformation = {
                      serverUrl: server.url,
                      userName: selectedUsername
                    };
                    await AuthorizationService.verifyuserisloggedin(
                      connectionInfo
                    );
                    props.onConnectionVerified(selectedUsername);
                  } catch {
                    setErrorMessage(
                      "Not able to authenticate to WITSML server with given credentials"
                    );
                  } finally {
                    setIsSwitchingUser(false);
                  }
                }}
              >
                Switch user {isSwitchingUser && <Progress.Dots />}
              </Button>
            </Row>
          )}
          <Checkbox
            label={`Keep me logged in to this server for 24 hours`}
            defaultChecked={keepLoggedIn}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setKeepLoggedIn(e.target.checked);
            }}
            colors={colors}
          />
        </>
      }
      confirmDisabled={!validText(username) || !validText(password)}
      confirmText={confirmText ?? "Login"}
      onSubmit={onVerifyConnection}
      onCancel={() => {
        AuthorizationService.onAuthorizationChangeDispatch({
          server,
          status: AuthorizationStatus.Cancel
        });
        dispatchOperation({ type: OperationType.HideModal });
        if (props.onCancel) {
          props.onCancel();
        }
      }}
      isLoading={isLoading}
      errorMessage={errorMessage}
      width={ModalWidth.SMALL}
    />
  );
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 30px 0 20px 0;
  align-items: flex-end;
`;

export default UserCredentialsModal;
