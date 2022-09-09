import { Typography } from "@equinor/eds-core-react";
import { Divider, ListItemIcon, makeStyles, MenuItem } from "@material-ui/core";
import { ImportExport } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreLogAction, UpdateWellboreLogsAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { createCopyLogDataJob, LogCurvesReference, parseStringToLogCurvesReference } from "../../models/jobs/copyLogDataJob";
import { DeleteLogObjectsJob } from "../../models/jobs/deleteJobs";
import LogReference from "../../models/jobs/logReference";
import LogReferences from "../../models/jobs/logReferences";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import LogObjectService from "../../services/logObjectService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import { LogObjectRow } from "../ContentViews/LogsListView";
import ConfirmModal from "../Modals/ConfirmModal";
import LogDataImportModal, { LogDataImportModalProps } from "../Modals/LogDataImportModal";
import LogPropertiesModal from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TrimLogObjectModal, { TrimLogObjectModalProps } from "../Modals/TrimLogObject/TrimLogObjectModal";
import ContextMenu from "./ContextMenu";
import { onClickCopyToServer } from "./CopyLogToServer";
import { onClickPaste } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface LogObjectContextMenuProps {
  checkedLogObjectRows: LogObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreLogAction | UpdateWellboreLogsAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const useContextMenuIconStyle = makeStyles({ iconStyle: { width: 16, height: 16, color: "#007079" } });

const LogObjectContextMenu = (props: LogObjectContextMenuProps): React.ReactElement => {
  const { checkedLogObjectRows, dispatchOperation, dispatchNavigation, selectedServer, servers } = props;
  const [logCurvesReference, setLogCurvesReference] = useState<LogCurvesReference>(null);
  const classes = useContextMenuIconStyle();

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
    const logPropertiesModalProps = { mode: PropertiesModalMode.Edit, logObject, dispatchOperation };
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

  const blockStyle = {
    display: "grid"
  };

  const pluralize = (noun: string, suffix = "s") => `${checkedLogObjectRows.length > 1 ? checkedLogObjectRows.length : ""} ${noun}${checkedLogObjectRows.length > 1 ? suffix : ""}`;

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={`Delete ${pluralize("selected log")}`}
        content={
          <span style={blockStyle}>
            This will permanently delete: <strong>{checkedLogObjectRows.map((item) => item.name).join("\n")}</strong>
          </span>
        }
        onConfirm={deleteLogObjects}
        confirmColor={"secondary"}
        confirmText={`Delete ${pluralize("log")}?`}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickImport = async () => {
    const logDataImportModalProps: LogDataImportModalProps = { targetLog: checkedLogObjectRows[0], dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogDataImportModal {...logDataImportModalProps} /> });
  };

  const deleteLogObjects = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteLogObjectsJob = {
      toDelete: {
        logReferenceList: checkedLogObjectRows.map((row) => ({
          wellUid: row.wellUid,
          wellboreUid: row.wellboreUid,
          logUid: row.uid
        }))
      }
    };

    await JobService.orderJob(JobType.DeleteLogObjects, job);
    checkedLogObjectRows.length = 0;
    const freshLogs = await LogObjectService.getLogs(job.toDelete.logReferenceList[0].wellUid, job.toDelete.logReferenceList[0].wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateLogObjects,
      payload: { wellUid: job.toDelete.logReferenceList[0].wellUid, wellboreUid: job.toDelete.logReferenceList[0].wellboreUid, logs: freshLogs }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCopyLog = async () => {
    const logReferences: LogReferences = {
      serverUrl: selectedServer.url,
      logReferenceList: checkedLogObjectRows.map((row): LogReference => {
        return {
          wellUid: row.wellUid,
          wellboreUid: row.wellboreUid,
          logUid: row.uid
        };
      })
    };
    await navigator.clipboard.writeText(JSON.stringify(logReferences));
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
        <MenuItem key={"refreshlog"} onClick={onClickRefresh} disabled={checkedLogObjectRows.length !== 1}>
          <ListItemIcon>
            <Icon name="refresh" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Refresh log</Typography>
        </MenuItem>,
        <MenuItem key={"copylog"} onClick={onClickCopyLog} disabled={checkedLogObjectRows.length === 0}>
          <ListItemIcon>
            <Icon name="copy" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Copy {pluralize("log")}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"copyToServer"} label={"Copy log to server"} disabled={checkedLogObjectRows.length < 1}>
          {servers.map(
            (server: Server) =>
              server.id !== selectedServer.id && (
                <MenuItem
                  key={server.name}
                  onClick={() => onClickCopyToServer(server, selectedServer, checkedLogObjectRows, dispatchOperation)}
                  disabled={checkedLogObjectRows.length < 1}
                >
                  <Typography color={"primary"}>{server.name}</Typography>
                </MenuItem>
              )
          )}
        </NestedMenuItem>,
        <MenuItem
          key={"pastelogcurves"}
          onClick={() => onClickPaste(servers, logCurvesReference?.serverUrl, dispatchOperation, () => orderCopyPasteJob())}
          disabled={logCurvesReference === null || checkedLogObjectRows.length !== 1}
        >
          <ListItemIcon>
            <Icon name="paste" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Paste log curves</Typography>
        </MenuItem>,
        <MenuItem key={"trimlogobject"} onClick={onClickTrimLogObject} disabled={checkedLogObjectRows.length !== 1}>
          <ListItemIcon>
            <Icon name="formatLine" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Adjust range</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete} disabled={checkedLogObjectRows.length === 0}>
          <ListItemIcon>
            <Icon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem key={"importlogdata"} onClick={onClickImport} disabled={checkedLogObjectRows.length === 0}>
          <ListItemIcon>
            <ImportExport className={classes.iconStyle} />
          </ListItemIcon>
          <Typography color={"primary"}>Import log data from .csv</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedLogObjectRows.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(server)} disabled={checkedLogObjectRows.length !== 1}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedLogObjectRows.length !== 1}>
          <ListItemIcon>
            <Icon name="settings" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogObjectContextMenu;
