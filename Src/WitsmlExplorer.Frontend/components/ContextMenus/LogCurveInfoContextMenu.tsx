import React from "react";
import ContextMenu from "./ContextMenu";
import { MenuItem } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import { colors } from "../../styles/Colors";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import DeleteMnemonicsJob from "../../models/jobs/deleteMnemonicsJob";
import LogCurveInfoPropertiesModal from "../Modals/LogCurveInfoPropertiesModal";
import SelectIndexToDisplayModal from "../Modals/SelectIndexToDisplayModal";
import LogObject from "../../models/logObject";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { SelectLogCurveInfoAction } from "../../contexts/navigationStateReducer";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import { createLogCurvesReference } from "../../models/jobs/copyLogDataJob";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import { StyledIcon } from "./ContextMenuUtils";

export interface LogCurveInfoContextMenuProps {
  checkedLogCurveInfoRows: LogCurveInfoRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: SelectLogCurveInfoAction) => void;
  selectedLog: LogObject;
  selectedServer: Server;
}

const LogCurveInfoContextMenu = (props: LogCurveInfoContextMenuProps): React.ReactElement => {
  const { checkedLogCurveInfoRows, dispatchOperation, dispatchNavigation, selectedLog, selectedServer } = props;

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
      logObject: {
        wellUid,
        wellboreUid,
        logUid
      },
      mnemonics: checkedLogCurveInfoRows.map((item) => item.mnemonic)
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
