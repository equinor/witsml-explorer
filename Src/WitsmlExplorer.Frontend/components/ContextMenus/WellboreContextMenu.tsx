import React, { useEffect, useState } from "react";
import ContextMenu from "./ContextMenu";
import { Divider, ListItemIcon, MenuItem } from "@material-ui/core";
import WellborePropertiesModal, { WellborePropertiesModalProps } from "../Modals/WellborePropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import { v4 as uuid } from "uuid";
import WellboreService from "../../services/wellboreService";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import DeleteWellboreJob from "../../models/jobs/deleteWellboreJob";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { parseStringToLogReference } from "../../models/jobs/copyLogJob";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import { Server } from "../../models/server";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import WellboreReference from "../../models/jobs/wellboreReference";
import NestedMenuItem from "./NestedMenuItem";
import LogObject from "../../models/logObject";
import LogPropertiesModal, { IndexCurve, LogPropertiesModalInterface } from "../Modals/LogPropertiesModal";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreAction } from "../../contexts/navigationStateReducer";
import TrajectoryReference from "../../models/jobs/trajectoryReference";
import { parseStringToTrajectoryReference } from "../../models/jobs/copyTrajectoryJob";
import LogReferences from "../../models/jobs/logReferences";
import { Typography } from "@equinor/eds-core-react";
import { useClipboardTubularReferences } from "./TubularContextMenuUtils";

export interface WellboreContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreAction) => void;
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const WellboreContextMenu = (props: WellboreContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, wellbore, servers } = props;
  const [logReferences, setLogReferences] = useState<LogReferences>(null);
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

  const onClickNewWellbore = () => {
    const newWellbore: Wellbore = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellStatus: "",
      wellType: "",
      isActive: false,
      wellboreParentUid: wellbore.uid,
      wellboreParentName: wellbore.name,
      wellborePurpose: "unknown"
    };
    const wellborePropertiesModalProps: WellborePropertiesModalProps = { mode: PropertiesModalMode.New, wellbore: newWellbore, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <WellborePropertiesModal {...wellborePropertiesModalProps} /> };
    dispatchOperation(action);
  };

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexCurve: IndexCurve.Depth
    };
    const logPropertiesModalProps: LogPropertiesModalInterface = { mode: PropertiesModalMode.New, logObject: newLog, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> };
    dispatchOperation(action);
  };

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
      (jobType === JobType.CopyTubular && tubularReferences.serverUrl);
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
      (jobType === JobType.CopyTubular && { source: tubularReferences, target: wellboreReference });
    JobService.orderJob(jobType, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const deleteWellbore = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellboreJob = {
      wellboreReference: {
        wellUid: wellbore.wellUid,
        wellboreUid: wellbore.uid
      }
    };
    await JobService.orderJob(JobType.DeleteWellbore, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete wellbore?"}
        content={
          <span>
            This will permanently delete <strong>{wellbore.name}</strong> with uid: <strong>{wellbore.uid}</strong>
          </span>
        }
        onConfirm={deleteWellbore}
        confirmColor={"secondary"}
        confirmText={"Delete wellbore"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickRefresh = async () => {
    const refreshedWellbore = await WellboreService.getCompleteWellbore(wellbore.wellUid, wellbore.uid);
    dispatchNavigation({
      type: ModificationType.UpdateWellbore,
      payload: { wellbore: refreshedWellbore }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickProperties = async () => {
    const controller = new AbortController();
    const detailedWellbore = await WellboreService.getWellbore(wellbore.wellUid, wellbore.uid, controller.signal);
    const wellborePropertiesModalProps: WellborePropertiesModalProps = { mode: PropertiesModalMode.Edit, wellbore: detailedWellbore, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellborePropertiesModal {...wellborePropertiesModalProps} /> });
  };

  const onClickShowOnServer = async (server: Server) => {
    const host = `${window.location.protocol}//${window.location.host}`;
    const wellboreUrl = `${host}/?serverUrl=${server.url}&wellUid=${wellbore.wellUid}&wellboreUid=${wellbore.uid}`;
    window.open(wellboreUrl);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshwellbore"} onClick={onClickRefresh}>
          <ListItemIcon>
            <Icon name="refresh" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Refresh wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newwellbore"} onClick={onClickNewWellbore}>
          <ListItemIcon>
            <Icon name="add" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>New wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newlog"} onClick={onClickNewLog}>
          <ListItemIcon>
            <Icon name="add" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <MenuItem key={"pasteLog"} onClick={() => onClickPaste(JobType.CopyLog)} disabled={logReferences === null}>
          <ListItemIcon>
            <Icon name="paste" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Paste log</Typography>
        </MenuItem>,
        <MenuItem key={"pasteTrajectory"} onClick={() => onClickPaste(JobType.CopyTrajectory)} disabled={trajectoryReference === null}>
          <ListItemIcon>
            <Icon name="paste" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Paste trajectory</Typography>
        </MenuItem>,
        <MenuItem key={"pasteTubular"} onClick={() => onClickPaste(JobType.CopyTubular)} disabled={tubularReferences === null}>
          <ListItemIcon>
            <Icon name="paste" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Paste tubular{tubularReferences?.tubularUids.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete}>
          <ListItemIcon>
            <Icon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(server)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <ListItemIcon>
            <Icon name="settings" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WellboreContextMenu;
