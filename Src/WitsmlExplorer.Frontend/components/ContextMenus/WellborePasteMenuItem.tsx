import { Typography } from "@equinor/eds-core-react";
import { ListItemIcon, MenuItem } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { parseStringToLogReference } from "../../models/jobs/copyLogJob";
import { parseStringToTrajectoryReference } from "../../models/jobs/copyTrajectoryJob";
import LogReferences from "../../models/jobs/logReferences";
import TrajectoryReference from "../../models/jobs/trajectoryReference";
import WellboreReference from "../../models/jobs/wellboreReference";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import { useClipboardBhaRunReferences } from "./BhaRunContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardRigReferences } from "./RigContextMenuUtils";
import { useClipboardRiskReferences } from "./RiskContextMenuUtils";
import { useClipboardTubularReferences } from "./TubularContextMenuUtils";

export interface WellborePasteMenuItemProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const WellborePasteMenuItem = (props: WellborePasteMenuItemProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers } = props;
  const [bhaRunReferences] = useClipboardBhaRunReferences();
  const [logReferences, setLogReferences] = useState<LogReferences>(null);
  const [rigReferences] = useClipboardRigReferences();
  const [riskReferences] = useClipboardRiskReferences();
  const [trajectoryReference, setTrajectoryReference] = useState<TrajectoryReference>(null);
  const [tubularReferences] = useClipboardTubularReferences();

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const logReferences = parseStringToLogReference(clipboardText);
        setLogReferences(logReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const trajectoryReference = parseStringToTrajectoryReference(clipboardText);
        setTrajectoryReference(trajectoryReference);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  // ToDo: Equal LogObjectContextMenu.showCredentialModal...Should be refactored out?
  const showCredentialsModal = (jobType: JobType, server: Server, errorMessage: string) => {
    const onConnectionVerified = async (credentials: ServerCredentials) => {
      await CredentialsService.saveCredentials(credentials);
      jobType === JobType.CopyLog ? orderCopyJob(JobType.CopyLog) : orderCopyJob(JobType.CopyTrajectory);
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

  const onClickPaste = async (jobType: JobType) => {
    const sourceServerUrl =
      (jobType === JobType.CopyLog && logReferences.serverUrl) ||
      (jobType === JobType.CopyTrajectory && trajectoryReference.serverUrl) ||
      (jobType === JobType.CopyTubular && tubularReferences.serverUrl) ||
      (jobType === JobType.CopyBhaRun && bhaRunReferences.serverUrl) ||
      (jobType === JobType.CopyRisk && riskReferences.serverUrl) ||
      (jobType === JobType.CopyRig && rigReferences.serverUrl);
    const sourceServer = servers.find((server) => server.url === sourceServerUrl);
    if (sourceServer !== null) {
      CredentialsService.setSourceServer(sourceServer);
      const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
      if (!hasPassword) {
        showCredentialsModal(
          jobType,
          sourceServer,
          `You are trying to paste curve values from a server that you are not logged in to. Please provide username and password for ${sourceServer.name}.`
        );
      } else {
        orderCopyJob(jobType);
      }
    }
  };

  const orderCopyJob = (jobType: JobType) => {
    const wellboreReference: WellboreReference = {
      wellUid: wellbore.wellUid,
      wellboreUid: wellbore.uid
    };

    const copyJob =
      (jobType === JobType.CopyLog && { source: logReferences, target: wellboreReference }) ||
      (jobType === JobType.CopyTrajectory && { source: trajectoryReference, target: wellboreReference }) ||
      (jobType === JobType.CopyTubular && { source: tubularReferences, target: wellboreReference }) ||
      (jobType === JobType.CopyBhaRun && { source: bhaRunReferences, target: wellboreReference }) ||
      (jobType === JobType.CopyRisk && { source: riskReferences, target: wellboreReference }) ||
      (jobType === JobType.CopyRig && { source: rigReferences, target: wellboreReference });
    JobService.orderJob(jobType, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <NestedMenuItem key={"paste"} label={"Paste"} icon="paste">
      <MenuItem key={"pasteBhaRun"} onClick={() => onClickPaste(JobType.CopyBhaRun)} disabled={bhaRunReferences === null}>
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.bhaRunUids.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem key={"pasteLog"} onClick={() => onClickPaste(JobType.CopyLog)} disabled={logReferences === null}>
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste log{logReferences?.logReferenceList.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem key={"pasteRig"} onClick={() => onClickPaste(JobType.CopyRig)} disabled={rigReferences === null}>
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste rig{rigReferences?.rigUids.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem key={"pasteRisk"} onClick={() => onClickPaste(JobType.CopyRisk)} disabled={riskReferences === null}>
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste risk{riskReferences?.riskUids.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem key={"pasteTrajectory"} onClick={() => onClickPaste(JobType.CopyTrajectory)} disabled={trajectoryReference === null}>
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste trajectory</Typography>
      </MenuItem>
      <MenuItem key={"pasteTubular"} onClick={() => onClickPaste(JobType.CopyTubular)} disabled={tubularReferences === null}>
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste tubular{tubularReferences?.tubularUids.length > 1 && "s"}</Typography>
      </MenuItem>
    </NestedMenuItem>
  );
};

export default WellborePasteMenuItem;
