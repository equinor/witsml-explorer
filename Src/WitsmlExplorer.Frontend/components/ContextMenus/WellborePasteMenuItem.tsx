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
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import { useClipboardBhaRunReferences } from "./BhaRunContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
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
      <MenuItem
        key={"pasteBhaRun"}
        onClick={() => onClickPaste(servers, bhaRunReferences?.serverUrl, dispatchOperation, () => orderCopyJob(JobType.CopyBhaRun))}
        disabled={bhaRunReferences === null}
      >
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste bhaRun{bhaRunReferences?.bhaRunUids.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem
        key={"pasteLog"}
        onClick={() => onClickPaste(servers, logReferences?.serverUrl, dispatchOperation, () => orderCopyJob(JobType.CopyLog))}
        disabled={logReferences === null}
      >
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste log{logReferences?.logReferenceList.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem
        key={"pasteRig"}
        onClick={() => onClickPaste(servers, rigReferences?.serverUrl, dispatchOperation, () => orderCopyJob(JobType.CopyRig))}
        disabled={rigReferences === null}
      >
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste rig{rigReferences?.rigUids.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem
        key={"pasteRisk"}
        onClick={() => onClickPaste(servers, riskReferences?.serverUrl, dispatchOperation, () => orderCopyJob(JobType.CopyRisk))}
        disabled={riskReferences === null}
      >
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste risk{riskReferences?.riskUids.length > 1 && "s"}</Typography>
      </MenuItem>
      <MenuItem
        key={"pasteTrajectory"}
        onClick={() => onClickPaste(servers, trajectoryReference?.serverUrl, dispatchOperation, () => orderCopyJob(JobType.CopyTrajectory))}
        disabled={trajectoryReference === null}
      >
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste trajectory</Typography>
      </MenuItem>
      <MenuItem
        key={"pasteTubular"}
        onClick={() => onClickPaste(servers, tubularReferences?.serverUrl, dispatchOperation, () => orderCopyJob(JobType.CopyTubular))}
        disabled={tubularReferences === null}
      >
        <ListItemIcon>
          <Icon name="paste" color={colors.interactive.primaryResting} />
        </ListItemIcon>
        <Typography color={"primary"}>Paste tubular{tubularReferences?.tubularUids.length > 1 && "s"}</Typography>
      </MenuItem>
    </NestedMenuItem>
  );
};

export default WellborePasteMenuItem;
