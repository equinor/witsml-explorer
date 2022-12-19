import { Autocomplete, Typography, Label, Button, TextField } from "@equinor/eds-core-react";
import React, { ChangeEvent, useEffect, useState, ReactElement } from "react";
import styled from "styled-components";
import ModificationType from "../../contexts/modificationType";
import { DisplayModalAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import ServerService from "../../services/serverService";
import { colors } from "../../styles/Colors";
import ModalDialog, { controlButtonPosition, ModalWidth } from "./ModalDialog";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "./UserCredentialsModal";
import { validText } from "./ModalParts";
import WellService from "../../services/wellService";
import Icons from "../../styles/Icons";
import NavigationType from "../../contexts/navigationType";
import { useTheme } from "@material-ui/core/styles";
import { AddServerAction, RemoveWitsmlServerAction, UpdateServerAction, UpdateWellsAction } from "../../contexts/modificationActions";
import { SelectServerAction } from "../../contexts/navigationActions";
import { msalEnabled } from "../../msal/MsalAuthProvider";
import { useIsAuthenticated } from "@azure/msal-react";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

export interface ServerModalProps {
  server: Server;
  dispatchNavigation: (action: AddServerAction | UpdateServerAction | RemoveWitsmlServerAction | UpdateWellsAction | SelectServerAction) => void;
  dispatchOperation: (action: HideModalAction | DisplayModalAction) => void;
  connectionVerified?: boolean;
  serverCredentials?: BasicServerCredentials;
  standalone?: boolean;
  errorMessage?: string;
}

const ServerModal = (props: ServerModalProps): React.ReactElement => {
  const { dispatchOperation, dispatchNavigation } = props;
  const [server, setServer] = useState<Server>(props.server);
  const [connectionVerified, setConnectionVerified] = useState<boolean>(props.connectionVerified ?? true);
  const [displayUrlError, setDisplayUrlError] = useState<boolean>(false);
  const [displayNameError, setDisplayServerNameError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAddingNewServer = props.server.id === undefined;
  const schemeValues = ["OAuth2"];
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [standAlone] = useState<boolean>(props.standalone ?? false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasFetchedServers, setHasFetchedServers] = useState(false);
  const [connected, isconnected] = useState(false);

  useEffect(() => {
    if (props.errorMessage !== "") {
      setErrorMessage(props.errorMessage);
      setIsLoading(false);
    }
  }, [props]);

  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  useEffect(() => {
    if (isAuthenticated && !hasFetchedServers) {
      const abortController = new AbortController();
      const getServers = async () => {
        const freshServers = await ServerService.getServers(abortController.signal);
        setHasFetchedServers(true);
        CredentialsService.saveServers(freshServers);
      };
      getServers();
      return () => {
        abortController.abort();
      };
    }
  }, [isAuthenticated]);

  const Styles = {
    feildname: { fontSize: "1rem", fontWeight: 500, color: colors.text.staticIconsDefault, paddingLeft: "0.9rem" },
    noServer: { alignItems: "center", display: "flex", fontSize: "1.4rem", color: "colors.interactive.primaryResting", gap: "4px" },
    noserverHeading: { marginLeft: "0.25rem", fontSize: "1.4rem", position: "relative" },
    testConnectnBtn: { gridColumn: "2/3", display: "flex", alignItems: "end", justifyContent: "flex-end" },
    noServerText: { position: "relative", display: "flex", justifyContent: "center", paddingTop: "3rem", paddingBottom: "3rem", alignItems: "center" },
    errorText: { position: "absolute" as "absolute", right: "10.5rem", top: "6.5rem" },
    noServerContent: { margin: "0 10rem 1rem 7rem" },
    authentication: { gridColumn: "2/3", paddingLeft: "0" }
  } as unknown as  CSSProperties;

  const onSubmit = async () => {
    const abortController = new AbortController();

    setIsLoading(true);
    const credentials = {
      server,
      username,
      password
    };
    if (isAddingNewServer || standAlone) {
      try {
        const blank = "blank";
        isconnected(true);
        await CredentialsService.verifyCredentials(credentials, false);
        CredentialsService.saveCredentials({ ...credentials, password: blank });
        const freshServer = await ServerService.addServer(server, abortController.signal);
        isconnected(false);
        dispatchNavigation({ type: ModificationType.AddServer, payload: { server: freshServer } });
        const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server: freshServer } };
        dispatchNavigation(action);
        const wells = await WellService.getWells(abortController.signal);
        dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
      } catch (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        isconnected(false);
      }
    } else {
      try {
        const blank = "blank";
        await CredentialsService.verifyCredentials(credentials, false);
        CredentialsService.saveCredentials({ ...credentials, password: blank });
        const freshServer = await ServerService.updateServer(server, abortController.signal);
        dispatchNavigation({ type: ModificationType.UpdateServer, payload: { server: freshServer } });
        const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server } }; //updating selected server
        dispatchNavigation(action);
        dispatchOperation({ type: OperationType.HideModal });
      } catch (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    }
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

    const serverCredentials: BasicServerCredentials = { username: "", password: "", server };
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
    return server.name.length !== 0 && isUrlValid(server?.url);
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

  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const setStandAlonePopup: ReactElement = (
    <React.Fragment key={"standalone"}>
      {standAlone ? (
        <div style={{ position: "relative", display: "flex", justifyContent: "center", paddingTop: "3rem", paddingBottom: "3rem", alignItems: "center" }}>
          <Typography
            style={Styles.noServer}
            token={{
              color: colors.interactive.primaryResting,
              fontWeight: 500
            }}
          >
            <Icons name="alert" size={32} />
            No server Connected!
          </Typography>
          {standAlone && (
            <Typography style={Styles.errorText} color="danger" token={{ fontWeight: 500, fontSize: "1rem" }}>
              {errorMessage}
            </Typography>
          )}
        </div>
      ) : (
        ""
      )}
      <Section style={standAlone ? Styles.noServerContent : Styles.feildname} compactMode={isCompactMode}>
        <Label label="Server URL" style={Styles.feildname} />
        <TextField
          id="url"
          className="fieldInputs"
          defaultValue={server?.url}
          variant={displayUrlError ? "error" : null}
          helperText={displayUrlError ? "Not a valid server url" : ""}
          onChange={onChangeUrl}
          onBlur={runUrlValidation}
          required
        />
        <Label label="Server Name" style={Styles.feildname} />
        <TextField
          id="name"
          className="fieldInputs"
          variant={displayUrlError ? "error" : null}
          defaultValue={server?.name}
          helperText={displayNameError ? "A server name must have 1-64 characters" : ""}
          onBlur={runServerNameValidation}
          onChange={onChangeName}
          required
        />
        <Label label="Username" style={Styles.feildname} />
        <TextField
          id="username"
          className="fieldInputs"
          variant={username?.length === 0 ? "error" : null}
          helperText={username?.length === 0 ? "Not a valid UserName" : ""}
          defaultValue={username}
          onChange={(e: any) => setUsername(e.target.value)}
          required
        />
        <Label label="Password" style={Styles.feildname} />
        <TextField
          id={"password"}
          label={""}
          defaultValue={password}
          variant={password?.length === 0 ? "error" : null}
          helperText={password?.length === 0 ? "Password must be 1-7936 characters" : ""}
          type="password"
          autoComplete="current-password"
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <Label label=" Scheme " style={Styles.feildname} />
        <Autocomplete
          id="securityScheme"
          options={schemeValues}
          label={""}
          initialSelectedOptions={[server.securityscheme || schemeValues[0]]}
          onOptionsChange={({ selectedItems }) => {
            setServer({ ...server, securityscheme: selectedItems[0] || schemeValues[0] });
          }}
          hideClearButton={true}
          disabled
        />
        <Label label="Roles" style={Styles.feildname} />
        <TextField id="role" label="" defaultValue={server.roles?.join(" ")} onChange={(e: any) => setServer({ ...server, roles: e.target.value.split(" ") })} />
        <div style={Styles.testConnectnBtn}>
          <div>
            <TestServerButton disabled={displayUrlError || connectionVerified} onClick={showCredentialsModal} color={"primary"} variant="outlined">
              <Icons name="done" /> {"Test connection"}
            </TestServerButton>
            {standAlone && (
              <TestServerButton disabled={!validateForm() || !validText(username) || !validText(password) || connected} color={"primary"} variant="outlined" onClick={onSubmit}>
                <Icons name="save" size={24} />
                {"Connect & Save"}
              </TestServerButton>
            )}
          </div>
        </div>
      </Section>
    </React.Fragment>
  );
  return (
    <React.Fragment key={"popupscreen"}>
      {!standAlone ? (
        <ModalDialog
          heading={`${isAddingNewServer ? "Add" : "Edit"} server`}
          content={setStandAlonePopup}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onDelete={server.id ? showDeleteModal : null}
          errorMessage={errorMessage}
          ButtonPosition={controlButtonPosition.TOP}
          confirmDisabled={!validateForm() || !validText(username) || !validText(password)}
          width={ModalWidth.LARGE}
        />
      ) : (
        setStandAlonePopup
      )}
    </React.Fragment>
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
const Section = styled.div<{ compactMode: boolean }>`
  display: grid;
  grid-template-columns: 9em 2fr;
  align-items: center;
  margin: 0 6rem 0.75rem 3rem;
  row-gap: ${(props) => (props.compactMode ? "1rem" : "1.8rem")};
`;
const TestServerButton = styled(Button)`
  && {
    margin-left: 1em;
  }
  flex: initial;
`;

export default ServerModal;
