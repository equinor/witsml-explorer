import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { MenuItem, ListItemIcon } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { UpdateWellboreBhaRunsAction } from "../../contexts/navigationStateReducer";
import BhaRunPropertiesModal, { BhaRunPropertiesModalProps } from "../Modals/BhaRunPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { BhaRunRow } from "../ContentViews/BhaRunsListView";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import BhaRunService from "../../services/bhaRunService";
import ModificationType from "../../contexts/modificationType";
import BhaRunReferences from "../../models/jobs/bhaRunReferences";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import Wellbore from "../../models/wellbore";
import WellboreReference from "../../models/jobs/wellboreReference";
import { useClipboardBhaRunReferences } from "./BhaRunContextMenuUtils";

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

  const onClickPaste = async () => {
    const sourceServer = servers.find((server) => server.url === bhaRunReferences.serverUrl);
    if (sourceServer !== null) {
      CredentialsService.setSourceServer(sourceServer);
      const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
      if (!hasPassword) {
        showCredentialsModal();
      } else {
        orderCopyJob();
      }
    }
  };

  const showCredentialsModal = () => {
    const onConnectionVerified = async (credentials: ServerCredentials) => {
      await CredentialsService.saveCredentials(credentials);
      orderCopyJob();
      dispatchOperation({ type: OperationType.HideModal });
    };

    const currentCredentials = CredentialsService.getSourceServerCredentials();
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: selectedServer,
      serverCredentials: currentCredentials,
      mode: CredentialsMode.TEST,
      errorMessage: `You are trying to paste a bhaRun from a server that you are not logged in to. Please provide username and password for ${selectedServer.name}.`,
      onConnectionVerified,
      confirmText: "Save"
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  const orderCopyJob = () => {
    const wellboreReference: WellboreReference = {
      wellUid: wellbore.wellUid,
      wellboreUid: wellbore.uid
    };

    const copyJob = { source: bhaRunReferences, target: wellboreReference };
    JobService.orderJob(JobType.CopyBhaRun, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedBhaRunRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedBhaRunRows.length === 0}>
          <ListItemIcon>
            <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem key={"copy"} onClick={onClickCopy} disabled={checkedBhaRunRows.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy bha run{checkedBhaRunRows?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={onClickPaste} disabled={bhaRunReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.bhaRunUids.length > 1 && "s"}</Typography>
        </MenuItem>
      ]}
    />
  );
};

const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export default BhaRunContextMenu;
