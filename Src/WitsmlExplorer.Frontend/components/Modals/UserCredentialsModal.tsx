import { Checkbox } from "@equinor/eds-core-react";
import { TextField } from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import ModalDialog, { controlButtonPosition, ModalWidth } from "./ModalDialog";
import { validText } from "./ModalParts";

export interface UserCredentialsModalProps {
  server: Server;
  serverCredentials: BasicServerCredentials;
  mode: CredentialsMode;
  errorMessage?: string;
  onConnectionVerified?: (credentials?: BasicServerCredentials) => void;
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
  const [keepLoggedIn, setKeepLoggedIn] = useState<boolean>(CredentialsService.keepLoggedInToServer(server.url));

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
      const blank = "blank";
      await CredentialsService.verifyCredentials(credentials, keepLoggedIn);
      CredentialsService.saveCredentials({ ...credentials, password: blank });
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
      const blank = "";
      await CredentialsService.verifyCredentials(credentials, keepLoggedIn);
      props.onConnectionVerified({ ...credentials, password: blank });
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
            helperText={username?.length === 0 ? "Username must be 1-7936 characters" : ""}
            inputProps={{ minLength: 1, maxLength: 7936 }}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            autoFocus={shouldFocusPasswordInput}
            id={"password"}
            label={"Password"}
            defaultValue={password}
            error={!validText(password)}
            helperText={password?.length === 0 ? "Password must be 1-7936 characters" : ""}
            fullWidth
            type="password"
            autoComplete="current-password"
            inputProps={{ minLength: 1, maxLength: 7936 }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Checkbox
            label={`Keep me logged in to ${server.name} for 24 hours`}
            defaultChecked={keepLoggedIn}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setKeepLoggedIn(e.target.checked);
            }}
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
      ButtonPosition={controlButtonPosition.BOTTOM}
    />
  );
};

export default UserCredentialsModal;
