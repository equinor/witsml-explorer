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
  checkedLogObjectRows: LogObject[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreLogAction | UpdateWellboreLogsAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const LogObjectContextMenu = (props: LogObjectContextMenuProps): React.ReactElement => {
  const { checkedLogObjectRows: checkedLogObjectRows, dispatchOperation, dispatchNavigation, selectedServer, servers } = props;
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
    const logObject = checkedLogObjectRows[0];
    const logPropertiesModalProps = { mode: LogPropertiesModalMode.Edit, logObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickShowOnServer = async (server: Server) => {
    const logObject = checkedLogObjectRows[0];
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
    const copyLogDataJob = createCopyLogDataJob(logCurvesReference, checkedLogObjectRows[0]);
    JobService.orderJob(JobType.CopyLogData, copyLogDataJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickTrimLogObject = () => {
    const logObject = checkedLogObjectRows[0];
    const trimLogObjectProps: TrimLogObjectModalProps = { dispatchNavigation, dispatchOperation, logObject };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TrimLogObjectModal {...trimLogObjectProps} /> });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete selected logs?"}
        content={
          <span>
            This will permanently delete the selected logs: <strong>{checkedLogObjectRows.map((item) => item.name).join(", ")}</strong>
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
      logObjects: checkedLogObjectRows.map((row) => ({
        wellUid: row.wellUid,
        wellBoreUid: row.wellboreUid,
        logUid: row.uid
      }))
    };

    await JobService.orderJob(JobType.DeleteLogObjects, job);
    const freshLogs = await LogObjectService.getLogs(job.logObjects[0].wellUid, job.logObjects[0].wellBoreUid);
    dispatchNavigation({ type: ModificationType.UpdateLogObjects, payload: { wellUid: job.logObjects[0].wellUid, wellboreUid: job.logObjects[0].wellBoreUid, logs: freshLogs } });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCopyLog = async () => {
    const logReference = {
      serverUrl: selectedServer.url,
      wellUid: checkedLogObjectRows[0].wellUid,
      wellboreUid: checkedLogObjectRows[0].wellboreUid,
      logUid: checkedLogObjectRows[0].uid
    };
    await navigator.clipboard.writeText(JSON.stringify(logReference));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickRefresh = async () => {
    const log = await LogObjectService.getLog(checkedLogObjectRows[0].wellUid, checkedLogObjectRows[0].wellboreUid, checkedLogObjectRows[0].uid);
    dispatchNavigation({
      type: ModificationType.UpdateLogObject,
      payload: { log: log }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshlog"} onClick={onClickRefresh} disabled={checkedLogObjectRows.length != 0}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Refresh log</Typography>
        </MenuItem>,
        <MenuItem key={"copylog"} onClick={onClickCopyLog} disabled={checkedLogObjectRows.length != 0}>
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Copy log</Typography>
        </MenuItem>,
        <MenuItem key={"pastelogcurves"} onClick={onClickPasteLogCurves} disabled={logCurvesReference != null}>
          <ListItemIcon>
            <PasteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Paste log curves</Typography>
        </MenuItem>,
        <MenuItem key={"trimlogobject"} onClick={onClickTrimLogObject} disabled={checkedLogObjectRows.length != 0}>
          <ListItemIcon>
            <FormatLineSpacingIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Adjust range</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete} disabled={checkedLogObjectRows.length < 1}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedLogObjectRows.length != 0}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(server)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedLogObjectRows.length != 0}>
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
