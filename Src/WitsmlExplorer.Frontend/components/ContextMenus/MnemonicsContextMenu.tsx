import React from "react";
import ContextMenu from "./ContextMenu";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { DeleteLogCurveValuesJob } from "../../models/jobs/deleteLogCurveValuesJob";
import ConfirmModal from "../Modals/ConfirmModal";
import OperationType from "../../contexts/operationType";
import JobService, { JobType } from "../../services/jobService";
import styled from "styled-components";

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
            <Icon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <MenuTypography color={"primary"}>Delete</MenuTypography>
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

const MenuTypography = styled(Typography)`
  padding-left: 0.25rem;
`;

export default MnemonicsContextMenu;
