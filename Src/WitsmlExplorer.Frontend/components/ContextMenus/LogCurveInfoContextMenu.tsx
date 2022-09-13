import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { SelectLogCurveInfoAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { createLogCurvesReference } from "../../models/jobs/copyLogDataJob";
import { DeleteMnemonicsJob } from "../../models/jobs/deleteJobs";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import ConfirmModal from "../Modals/ConfirmModal";
import LogCurveInfoPropertiesModal from "../Modals/LogCurveInfoPropertiesModal";
import SelectIndexToDisplayModal from "../Modals/SelectIndexToDisplayModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickCopyCurveToServer } from "./CopyCurveToServer";
import NestedMenuItem from "./NestedMenuItem";

export interface LogCurveInfoContextMenuProps {
  checkedLogCurveInfoRows: LogCurveInfoRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: SelectLogCurveInfoAction) => void;
  selectedLog: LogObject;
  selectedServer: Server;
  servers: Server[];
}

const LogCurveInfoContextMenu = (props: LogCurveInfoContextMenuProps): React.ReactElement => {
  const { checkedLogCurveInfoRows, dispatchOperation, dispatchNavigation, selectedLog, selectedServer, servers } = props;

  const onClickOpen = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const modalProps = { selectedLogCurveInfoRow: checkedLogCurveInfoRows, selectedLog, dispatchOperation, dispatchNavigation };
    const displayModalAction: DisplayModalAction = { type: OperationType.DisplayModal, payload: <SelectIndexToDisplayModal {...modalProps} /> };
    dispatchOperation(displayModalAction);
  };

  const onClickCopy = async () => {
    const logCurvesReference = createLogCurvesReference(checkedLogCurveInfoRows, selectedLog, selectedServer.url);
    await navigator.clipboard.writeText(JSON.stringify(logCurvesReference));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDeleteMnemonics = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete selected mnemonics?"}
        content={
          <span>
            This will permanently delete the selected mnemonics: <strong>{checkedLogCurveInfoRows.map((item) => item.mnemonic).join(", ")}</strong>
          </span>
        }
        onConfirm={onConfirmDeleteMnemonics}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onConfirmDeleteMnemonics = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const { wellUid, wellboreUid, logUid } = checkedLogCurveInfoRows[0];
    const job: DeleteMnemonicsJob = {
      toDelete: {
        logReference: {
          wellUid,
          wellboreUid,
          logUid
        },
        mnemonics: checkedLogCurveInfoRows.map((item) => item.mnemonic)
      }
    };
    await JobService.orderJob(JobType.DeleteMnemonics, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickProperties = () => {
    const logCurveInfo = checkedLogCurveInfoRows[0];
    const logCurveInfoPropertiesModalProps = { logCurveInfo, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogCurveInfoPropertiesModal {...logCurveInfoPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"open"} onClick={onClickOpen} disabled={checkedLogCurveInfoRows.length === 0}>
          <StyledIcon name="folderOpen" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Open</Typography>
        </MenuItem>,
        <MenuItem key={"copy"} onClick={onClickCopy} disabled={checkedLogCurveInfoRows.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy</Typography>
        </MenuItem>,
        <NestedMenuItem key={"copyToServer"} label={`${menuItemText("copy", "curve", checkedLogCurveInfoRows)} to server`} disabled={checkedLogCurveInfoRows.length < 1}>
          {servers.map(
            (server: Server) =>
              server.id !== selectedServer.id && (
                <MenuItem
                  key={server.name}
                  onClick={() => onClickCopyCurveToServer(server, selectedServer, checkedLogCurveInfoRows, dispatchOperation)}
                  disabled={checkedLogCurveInfoRows.length < 1}
                >
                  <Typography color={"primary"}>{server.name}</Typography>
                </MenuItem>
              )
          )}
        </NestedMenuItem>,
        <MenuItem key={"delete"} onClick={onClickDeleteMnemonics} disabled={checkedLogCurveInfoRows.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedLogCurveInfoRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogCurveInfoContextMenu;
