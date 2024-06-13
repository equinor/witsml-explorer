import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText
} from "components/ContextMenus/ContextMenuUtils";
import ConfirmModal from "components/Modals/ConfirmModal";
import {
  OffsetLogCurveModal,
  OffsetLogCurveModalProps
} from "components/Modals/OffsetLogCurveModal";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import {
  DeleteLogCurveValuesJob,
  IndexRange
} from "models/jobs/deleteLogCurveValuesJob";
import LogObject from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";
import React from "react";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface MnemonicsContextMenuProps {
  log: LogObject;
  mnemonics: string[];
  indexRanges: IndexRange[];
}

const MnemonicsContextMenu = (
  props: MnemonicsContextMenuProps
): React.ReactElement => {
  const { dispatchOperation } = useOperationState();
  const { log, mnemonics, indexRanges } = props;

  const deleteLogCurveValues = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const deleteLogCurveValuesJob: DeleteLogCurveValuesJob = {
      logReference: toObjectReference(log),
      mnemonics: mnemonics,
      indexRanges: indexRanges
    };

    await JobService.orderJob(
      JobType.DeleteCurveValues,
      deleteLogCurveValuesJob
    );
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete values for logcurve?"}
        content={getContentMessage(mnemonics, indexRanges)}
        onConfirm={deleteLogCurveValues}
        confirmColor={"danger"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const onClickOffset = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const offsetLogCurveModalProps: OffsetLogCurveModalProps = {
      selectedLog: log,
      mnemonics,
      startIndex: indexRanges[0].startIndex,
      endIndex: indexRanges[0].endIndex
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <OffsetLogCurveModal {...offsetLogCurveModalProps} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={onClickDelete}>
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem
          key={"offset"}
          onClick={onClickOffset}
          disabled={indexRanges.length != 1}
        >
          <StyledIcon name="tune" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("offset", ComponentType.Mnemonic, mnemonics)}
          </Typography>
        </MenuItem>
      ]}
    />
  );
};

const getContentMessage = (mnemonics: string[], indexRanges: IndexRange[]) => {
  const mnemonicsString = mnemonics.map((m) => `"${m}"`).join(", ");
  return (
    <>
      <p>This will permanently delete selected index ranges: </p>
      {indexRanges.map((r) => (
        <p key={r.startIndex}>
          [{r.startIndex} - {r.endIndex}]
          <br />
        </p>
      ))}
      <p>
        from mnemonics: <br />
        {mnemonicsString}
      </p>
    </>
  );
};

export default MnemonicsContextMenu;
