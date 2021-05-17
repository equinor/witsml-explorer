import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import ModalDialog, { ModalWidth } from "./ModalDialog";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import { Server } from "../../models/server";
import { validText } from "./ModalParts";

export interface UserCredentialsModalProps {
  server: Server;
  serverCredentials: ServerCredentials;
  mode: CredentialsMode;
  errorMessage?: string;
  onConnectionVerified?: (credentials?: ServerCredentials) => void;
  onCancel?: () => void;
  confirmText?: string;
}

export enum CredentialsMode {
  SAVE,
  TEST
}

const UserCredentialsModal = (props: UserCredentialsModalProps): React.ReactElement => {
  const { mode, server, serverCredentials, confirmText } = props;
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const shouldFocusPasswordInput = !!username;

  useEffect(() => {
    if (serverCredentials) {
      setUsername(serverCredentials.username);
      setPassword(serverCredentials.password);
    }
  }, [serverCredentials]);

  useEffect(() => {
    if (props.errorMessage !== "") {
      setErrorMessage(props.errorMessage);
      setIsLoading(false);
    }
  }, [props]);

  const onSave = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const credentials = {
      server,
      username,
      password
    };
    try {
      const encryptedPassword = await CredentialsService.verifyCredentials(credentials);
      CredentialsService.saveCredentials({ ...credentials, password: encryptedPassword });
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  const onVerifyConnection = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const credentials = {
      server,
      username,
      password
    };
    try {
      const encryptedPassword = await CredentialsService.verifyCredentials(credentials);
      props.onConnectionVerified({ ...credentials, password: encryptedPassword });
    } catch (error) {
      setErrorMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <ModalDialog
      heading={`Access server "${server.name}"`}
      content={
        <>
          <TextField
            autoFocus={!shouldFocusPasswordInput}
            id={"username"}
            label={"Username"}
            defaultValue={username}
            required
            fullWidth
            error={!validText(username)}
            helperText={username?.length === 0 ? "Username must be 1-64 characters" : ""}
            inputProps={{ minLength: 1, maxLength: 64 }}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            autoFocus={shouldFocusPasswordInput}
            id={"password"}
            label={"Password"}
            defaultValue={password}
            error={!validText(password)}
            helperText={password?.length === 0 ? "Password must be 1-64 characters" : ""}
            fullWidth
            type="password"
            autoComplete="current-password"
            inputProps={{ minLength: 1, maxLength: 64 }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      }
      confirmDisabled={!validText(username) || !validText(password)}
      confirmText={confirmText ?? mode === CredentialsMode.SAVE ? "Login" : "Test"}
      onSubmit={mode === CredentialsMode.SAVE ? onSave : onVerifyConnection}
      onCancel={props.onCancel}
      isLoading={isLoading}
      errorMessage={errorMessage}
      width={ModalWidth.SMALL}
    />
  );
};

export default UserCredentialsModal;
