import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import { colors } from "../../styles/Colors";
import { UpdateWellboreBhaRunsAction } from "../../contexts/navigationStateReducer";
import BhaRunPropertiesModal, { BhaRunPropertiesModalProps } from "../Modals/BhaRunPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import { BhaRunRow } from "../ContentViews/BhaRunsListView";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import BhaRunService from "../../services/bhaRunService";
import ModificationType from "../../contexts/modificationType";
import BhaRunReferences from "../../models/jobs/bhaRunReferences";
import Wellbore from "../../models/wellbore";
import { onClickPaste, useClipboardBhaRunReferences } from "./BhaRunContextMenuUtils";
import { StyledIcon } from "./ContextMenuUtils";

export interface BhaRunContextMenuProps {
  checkedBhaRunRows: BhaRunRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreBhaRunsAction) => void;
  servers: Server[];
  wellbore: Wellbore;
  selectedServer: Server;
}

const BhaRunContextMenu = (props: BhaRunContextMenuProps): React.ReactElement => {
  const { checkedBhaRunRows, wellbore, dispatchOperation, dispatchNavigation, selectedServer, servers } = props;
  const [bhaRunReferences] = useClipboardBhaRunReferences();

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyBhaRunProps: BhaRunPropertiesModalProps = { mode, bhaRun: checkedBhaRunRows[0].bhaRun, dispatchOperation, dispatchNavigation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <BhaRunPropertiesModal {...modifyBhaRunProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const deleteBhaRuns = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      bhaRunReferences: {
        bhaRunUids: checkedBhaRunRows.map((bhaRun) => bhaRun.uid),
        wellUid: checkedBhaRunRows[0].wellUid,
        wellboreUid: checkedBhaRunRows[0].wellboreUid
      }
    };
    await JobService.orderJob(JobType.DeleteBhaRuns, job);
    const freshBhaRuns = await BhaRunService.getBhaRuns(checkedBhaRunRows[0].bhaRun.wellUid, checkedBhaRunRows[0].bhaRun.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateBhaRuns,
      payload: {
        wellUid: job.bhaRunReferences.wellUid,
        wellboreUid: job.bhaRunReferences.wellboreUid,
        bhaRuns: freshBhaRuns
      }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete bha run(s)?"}
        content={
          <span>
            This will permanently delete bha runs: <strong>{checkedBhaRunRows.map((item) => item.uid).join(", ")}</strong>
          </span>
        }
        onConfirm={() => deleteBhaRuns()}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickCopy = async () => {
    const bhaRunReferences: BhaRunReferences = {
      serverUrl: selectedServer.url,
      bhaRunUids: checkedBhaRunRows.map((bhaRun) => bhaRun.uid),
      wellUid: checkedBhaRunRows[0].wellUid,
      wellboreUid: checkedBhaRunRows[0].wellboreUid
    };
    await navigator.clipboard.writeText(JSON.stringify(bhaRunReferences));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedBhaRunRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>,
        <MenuItem key={"copy"} onClick={onClickCopy} disabled={checkedBhaRunRows.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy bhaRun{checkedBhaRunRows?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, dispatchOperation, wellbore, bhaRunReferences)} disabled={bhaRunReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.bhaRunUids.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedBhaRunRows.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default BhaRunContextMenu;
