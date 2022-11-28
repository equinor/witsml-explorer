import { Autocomplete, Checkbox, Icon, Typography, Label, Progress } from "@equinor/eds-core-react";
import { Button, FormControlLabel, TextField } from "@material-ui/core";
import React, { ChangeEvent, useContext, useEffect, useState, ReactElement } from "react";
import styled from "styled-components";
import ModificationType from "../../contexts/modificationType";
import { AddServerAction, RemoveWitsmlServerAction, SelectServerAction, UpdateServerAction, UpdateWellsAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService,{ BasicServerCredentials } from "../../services/credentialsService"
import ServerService from "../../services/serverService";
import { colors } from "../../styles/Colors";
import ModalDialog, { controlButtonPosition } from "./ModalDialog";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "./UserCredentialsModal";
import { validText } from "./ModalParts";
import WellService from "../../services/wellService";
import NavigationContext from "../../contexts/navigationContext";
import Icons from "../../styles/Icons";
import NavigationType from "../../contexts/navigationType";
import { useTheme } from "@material-ui/core/styles";
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
  const { dispatchOperation, serverCredentials } = props;
  const [server, setServer] = useState<Server>(props.server);
  const [connectionVerified, setConnectionVerified] = useState<boolean>(props.connectionVerified ?? true);
  const [displayUrlError, setDisplayUrlError] = useState<boolean>(false);
  const [displayNameError, setDisplayServerNameError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isAddingNewServer = props.server.id === undefined;
  const schemeValues = ["Basic", "OAuth2"];
  const [expanded, setExpanded] = useState<boolean>(false);
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [standAlone] = useState<boolean>(props.standalone ?? false);
  const { dispatchNavigation } = props ?? useContext(NavigationContext);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  const Styles={
    feildname: { fontSize: "1rem", fontWeight: 500, color:colors.text.staticIconsDefault, paddingLeft: "0.9rem" },
    noServer: { alignItems: "center", display: "flex", fontSize: "1.4rem", color: "colors.interactive.primaryResting", gap:"4px" },
    noserverHeading: { marginLeft: "0.25rem", fontSize: "1.4rem" ,position:"relative"},
    testConnectnBtn: { gridColumn: "2/3", display: "flex", alignItems: "center", justifyContent: "space-between" },
    noServerText: { display: "flex", justifyContent: "center", paddingTop:"3rem",paddingBottom:"3rem", alignItems: "center",position:"relative" },
    errorText:{position:"absolute", right:"10.5rem",top:"6.5rem"},
    noServerContent:{margin:"0 10rem 1rem 7rem"}
  } as CSSProperties
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
        await CredentialsService.verifyCredentials(credentials, false);
        CredentialsService.saveCredentials({ ...credentials, password: blank });
        const freshServer = await ServerService.addServer(server, abortController.signal);
        dispatchNavigation({ type: ModificationType.AddServer, payload: { server: freshServer } });
        const wells = await WellService.getWells(abortController.signal);
        dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: wells } });
      } catch (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } else {
      try {
        const blank = "blank";
        await CredentialsService.verifyCredentials(credentials, false);
        CredentialsService.saveCredentials({ ...credentials, password: blank });
        const freshServer = await ServerService.updateServer(server, abortController.signal);
        dispatchNavigation({ type: ModificationType.UpdateServer, payload: { server: freshServer } });
        const action: SelectServerAction = { type: NavigationType.SelectServer, payload: { server } };//updating selected server
        dispatchNavigation(action);
        dispatchOperation({ type: OperationType.HideModal });
      } catch (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    }
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
        ButtonPosition={controlButtonPosition.BOTTOM}
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

  useEffect(() => {
    if (serverCredentials) {
      setUsername(serverCredentials.username);
      setPassword(serverCredentials.password);
    }
  }, [serverCredentials]);

  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const setStandAlonePopup: ReactElement = 
    <React.Fragment key={"standalone"}>
      {
        standAlone ? <div style={standAlone?Styles.noServerText:<></>}>
          <Typography style={Styles.noServer} token={{
            color: colors.interactive.primaryResting,
            fontWeight: 500,
          }} >
            <Icons name='new_alert' size={32} />
            No server Connected!
          </Typography>
          {standAlone && <Typography color="danger"  token={{fontWeight: 500,fontSize: '1rem',}} style={Styles.errorText} >{errorMessage}</Typography>}
        </div> : ""
      }
      <Section style={standAlone?Styles.noServerContent:Styles.feildname} compactMode={isCompactMode}>
        <Label label="Server URL" style={ Styles.feildname} />
        <TextField
          id="url"
          className="fieldInputs"
          size="small"
          variant="outlined"
          defaultValue={server?.url}
          error={displayUrlError}
          helperText={displayUrlError ? "Not a valid server url" : ""}
          fullWidth
          inputProps={{ maxLength: 256 }}
          onChange={onChangeUrl}
          onBlur={runUrlValidation}
          required />
        <Label label="Server Name" style={Styles.feildname} />
        <TextField
          id="name"
          className="fieldInputs"
          size="small"
          variant="outlined"
          defaultValue={server?.name}
          error={displayNameError}
          helperText={displayNameError ? "A server name must have 1-64 characters" : ""}
          fullWidth
          inputProps={{ minLength: 1, maxLength: 64 }}
          onBlur={runServerNameValidation}
          onChange={onChangeName}
          required />
        <Label label="Username" style={Styles.feildname} />
        <TextField
          id="username"
          className="fieldInputs"
          size="small"
          variant="outlined"
          helperText={username?.length === 0 ? "Not a valid UserName" : ""}
          defaultValue={username}
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ minLength: 1, maxLength: 64 }}
          required />
        <Label label="Password" style={Styles.feildname} />
        <TextField
          id={"password"}
          variant="outlined"
          className="fieldInputs"
          size="small"
          defaultValue={password}
          helperText={password?.length === 0 ? "Password must be 1-7936 characters" : ""}
          fullWidth
          type="password"
          autoComplete="current-password"
          inputProps={{ minLength: 1, maxLength: 7936 }}
          onChange={(e) => setPassword(e.target.value)}
          required />
        <Label label="Version" style={Styles.feildname} />
        <SelectVersion
          id=""
          label=""
          options={schemeValues}
          initialSelectedOptions={[server?.securityscheme || schemeValues[0]]}
          onOptionsChange={({ selectedItems }) => {
            setServer({ ...server });
          }} />
        <div style={Styles.testConnectnBtn}>
          <Typography color="primary" token={{
            fontSize: '1em',
            fontWeight: 500,
          }} onClick={() => setExpanded(!expanded)}>
            Advanced
          </Typography>
          <div>
            <TestServerButton disabled={displayUrlError || connectionVerified} onClick={showCredentialsModal} color={"primary"} variant="outlined">
              <Icons name='done'/> {"Test connection"}
            </TestServerButton >
            {standAlone &&
              <TestServerButton disabled={displayUrlError || connectionVerified} color={"primary"} variant="outlined" onClick={onSubmit}>
                <Icons name="save" size={24} />{"Connect & Save"}
              </TestServerButton>
            }
          </div>
        </div>
      </Section>
      <Container expanded={expanded}>
        {expanded && (
          <Section style={standAlone?Styles.noServerContent:Styles.feildname} compactMode={isCompactMode}>
            <Label label="proxy Address" style={Styles.feildname} />
            <TextField
              id="proxy"
              className="fieldInputs"
              size="small"
              defaultValue={server.name}
              variant="outlined"
              fullWidth
              inputProps={{ minLength: 1, maxLength: 64 }}
              required />
            <Label label="port" style={Styles.feildname} />
            <TextField
              id="port"
              className="fieldInputs"
              size="small"
              defaultValue={server.name}
              variant="outlined"
              fullWidth
              inputProps={{ minLength: 1, maxLength: 64 }}
              required />
            <Label label="" htmlFor="Authentication" />
            <FormControlLabel
              control={<Checkbox
                id="curveThreshold-hideInactive" />}
              label={"Use Authentication"} />
            <Label label="Username" style={Styles.feildname} />
            <TextField
              id={"username"}
              className="fieldInputs"
              size="small"
              defaultValue={username}
              error={!validText(username)}
              helperText={username?.length === 0 ? "Username must be 1-7936 characters" : ""}
              inputProps={{ minLength: 1, maxLength: 7936 }}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              fullWidth
              required
              disabled />
            <Label label="password" style={Styles.feildname} />
            <TextField
              id="password"
              size="small"
              className="fieldInputs"
              disabled
              defaultValue={password}
              variant="outlined"
              fullWidth
              inputProps={{ minLength: 1, maxLength: 64 }}
              required />
          </Section>
        )}
      </Container>
    </React.Fragment>

  return (
    <React.Fragment key={'popupscreen'}>
      {!standAlone ?
        <ModalDialog
          heading={`${isAddingNewServer ? "Add" : "Edit"} server`}
          content=
          {setStandAlonePopup}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onDelete={server.id ? showDeleteModal : null}
          errorMessage={errorMessage}
          ButtonPosition={controlButtonPosition.TOP}
          confirmDisabled={!validateForm() || !validText(username) || !validText(password)}
        /> : setStandAlonePopup}
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
  row-gap: ${(props) => (props.compactMode ? "0.65rem" : "1.8rem")};
`;
const ShowAdvanceOption = styled.div`
  grid-column: 2/3;
  display flex;
  align-items: center;
  justify-content: space-between;

`;
const TestServerButton = styled(Button)`
  && {
    margin-left: 1em;
  }
  flex:initial;
`;

const SelectVersion = styled(Autocomplete)`
  background-color: white;
  border: 0.05em solid #ccc;
`;

const Container = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
export default ServerModal;
