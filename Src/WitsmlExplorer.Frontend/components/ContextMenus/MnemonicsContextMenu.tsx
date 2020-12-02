import React from "react";
import ContextMenu from "./ContextMenu";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { DeleteIcon } from "../Icons";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { DeleteLogCurveValuesJob } from "../../models/jobs/deleteLogCurveValuesJob";
import ConfirmModal from "../Modals/ConfirmModal";
import OperationType from "../../contexts/operationType";
import JobService, { JobType } from "../../services/jobService";

export interface MnemonicsContextMenuProps {
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  deleteLogCurveValuesJob: DeleteLogCurveValuesJob;
}

const MnemonicsContextMenu = (props: MnemonicsContextMenuProps): React.ReactElement => {
  const { deleteLogCurveValuesJob, dispatchOperation } = props;

  const deleteLogCurveValues = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    await JobService.orderJob(JobType.DeleteCurveValues, deleteLogCurveValuesJob);
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete values for logcurve?"}
        content={getContentMessage(deleteLogCurveValuesJob)}
        onConfirm={deleteLogCurveValues}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={onClickDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};

const getContentMessage = (deleteLogCurveValuesJob: DeleteLogCurveValuesJob) => {
  const mnemonics = deleteLogCurveValuesJob.mnemonics.map((m) => `"${m}"`).join(", ");
  return (
    <>
      <p>This will permanently delete selected index ranges: </p>
      {deleteLogCurveValuesJob.indexRanges.map((r) => (
        <p key={r.startIndex}>
          [{r.startIndex} - {r.endIndex}]
          <br />
        </p>
      ))}
      <p>
        from mnemonics: <br />
        {mnemonics}
      </p>
    </>
  );
};

export default MnemonicsContextMenu;
