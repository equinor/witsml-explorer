import LogPropertiesModal, { LogPropertiesModalMode } from "../Modals/LogPropertiesModal";
import React, { useEffect, useState } from "react";
import ContextMenu from "./ContextMenu";
import { Divider, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import JobService, { JobType } from "../../services/jobService";
import { createCopyLogDataJob, LogCurvesReference, parseStringToLogCurvesReference } from "../../models/jobs/copyLogDataJob";
import TrimLogObjectModal, { TrimLogObjectModalProps } from "../Modals/TrimLogObject/TrimLogObjectModal";
import { CopyIcon, DeleteIcon, FormatLineSpacingIcon, PasteIcon, RefreshIcon, SettingsIcon } from "../Icons";
import LogObjectService from "../../services/logObjectService";
import ConfirmModal from "../Modals/ConfirmModal";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreLogAction, UpdateWellboreLogsAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import NestedMenuItem from "./NestedMenuItem";

export interface LogObjectContextMenuProps {
  logObject: LogObject;
  selectedServer: Server;
  servers: Server[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreLogAction | UpdateWellboreLogsAction) => void;
}

const LogObjectContextMenu = (props: LogObjectContextMenuProps): React.ReactElement => {
  const { dispatchOperation, dispatchNavigation, logObject, selectedServer, servers } = props;
  const [logCurvesReference, setLogCurvesReference] = useState<LogCurvesReference>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const logCurvesReference = parseStringToLogCurvesReference(clipboardText);
        setLogCurvesReference(logCurvesReference);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  const onClickProperties = () => {
    const logPropertiesModalProps = { mode: LogPropertiesModalMode.Edit, logObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> });
  };

  const onClickShowOnServer = async (server: Server) => {
    const host = `${window.location.protocol}//${window.location.host}`;
    const logUrl = `${host}/?serverUrl=${server.url}&wellUid=${logObject.wellUid}&wellboreUid=${logObject.wellboreUid}&logObjectUid=${logObject.uid}`;
    window.open(logUrl);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickPasteLogCurves = async () => {
    const sourceServerUrl = logCurvesReference.logReference.serverUrl;
    const sourceServer = servers.find((server) => server.url === sourceServerUrl);
    if (sourceServer !== null) {
      CredentialsService.setSourceServer(sourceServer);
      const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
      if (!hasPassword) {
        showCredentialsModal(
          sourceServer,
          `You are trying to paste curve values from a server that you are not logged in to. Please provide username and password for ${sourceServer.name}.`
        );
      } else {
        orderCopyPasteJob();
      }
    }
  };

  const showCredentialsModal = (server: Server, errorMessage: string) => {
    const onConnectionVerified = async (credentials: ServerCredentials) => {
      await CredentialsService.saveCredentials(credentials);
      orderCopyPasteJob();
      dispatchOperation({ type: OperationType.HideModal });
    };

    const currentCredentials = CredentialsService.getSourceServerCredentials();
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: server,
      serverCredentials: currentCredentials,
      mode: CredentialsMode.TEST,
      errorMessage,
      onConnectionVerified,
      confirmText: "Save"
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  const orderCopyPasteJob = () => {
    const copyLogDataJob = createCopyLogDataJob(logCurvesReference, logObject);
    JobService.orderJob(JobType.CopyLogData, copyLogDataJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickTrimLogObject = () => {
    const trimLogObjectProps: TrimLogObjectModalProps = { dispatchNavigation, dispatchOperation, logObject };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TrimLogObjectModal {...trimLogObjectProps} /> });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete log object?"}
        content={
          <span>
            This will permanently delete <strong>{logObject.name}</strong>
          </span>
        }
        onConfirm={deleteLogObject}
        confirmColor={"secondary"}
        confirmText={"Delete log"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const deleteLogObject = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      logObject: {
        wellUid: logObject.wellUid,
        wellboreUid: logObject.wellboreUid,
        logUid: logObject.uid
      }
    };
    await JobService.orderJob(JobType.DeleteLogObject, job);
    const freshLogs = await LogObjectService.getLogs(job.logObject.wellUid, job.logObject.wellboreUid);
    dispatchNavigation({ type: ModificationType.UpdateLogObjects, payload: { wellUid: job.logObject.wellUid, wellboreUid: job.logObject.wellboreUid, logs: freshLogs } });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCopyLog = async () => {
    const logReference = {
      serverUrl: selectedServer.url,
      wellUid: logObject.wellUid,
      wellboreUid: logObject.wellboreUid,
      logUid: logObject.uid
    };
    await navigator.clipboard.writeText(JSON.stringify(logReference));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickRefresh = async () => {
    const log = await LogObjectService.getLog(logObject.wellUid, logObject.wellboreUid, logObject.uid);
    dispatchNavigation({
      type: ModificationType.UpdateLogObject,
      payload: { log: log }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshlog"} onClick={onClickRefresh}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Refresh log</Typography>
        </MenuItem>,
        <MenuItem key={"copylog"} onClick={onClickCopyLog}>
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Copy log</Typography>
        </MenuItem>,
        <MenuItem key={"pastelogcurves"} onClick={onClickPasteLogCurves} disabled={logCurvesReference === null}>
          <ListItemIcon>
            <PasteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Paste log curves</Typography>
        </MenuItem>,
        <MenuItem key={"trimlogobject"} onClick={onClickTrimLogObject}>
          <ListItemIcon>
            <FormatLineSpacingIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Adjust range</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(server)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogObjectContextMenu;
