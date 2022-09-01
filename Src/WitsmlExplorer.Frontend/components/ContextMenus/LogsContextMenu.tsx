import { Typography } from "@equinor/eds-core-react";
import { ListItemIcon, MenuItem } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import CopyLogJob, { parseStringToLogReference } from "../../models/jobs/copyLogJob";
import LogReferences from "../../models/jobs/logReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import LogPropertiesModal, { IndexCurve, LogPropertiesModalInterface } from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import ContextMenu from "./ContextMenu";

export interface LogsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  wellbore: Wellbore;
  servers: Server[];
  indexCurve: IndexCurve;
}

const LogsContextMenu = (props: LogsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, indexCurve } = props;
  const [logReferences, setLogReferences] = useState<LogReferences>(null);

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

  const orderCopyJob = (jobType: JobType) => {
    const targetWellboreReference: WellboreReference = {
      wellUid: wellbore.wellUid,
      wellboreUid: wellbore.uid
    };

    const copyJob: CopyLogJob = { source: logReferences, target: targetWellboreReference };
    JobService.orderJob(jobType, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const showCredentialsModal = (jobType: JobType, server: Server, errorMessage: string) => {
    const onConnectionVerified = async (credentials: BasicServerCredentials) => {
      await CredentialsService.saveCredentials(credentials);
      orderCopyJob(JobType.CopyLog);
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

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexCurve: indexCurve === IndexCurve.Time ? IndexCurve.Time : IndexCurve.Depth
    };
    const logPropertiesModalProps: LogPropertiesModalInterface = { mode: PropertiesModalMode.New, logObject: newLog, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> };
    dispatchOperation(action);
  };

  const onClickPaste = async (jobType: JobType) => {
    const sourceServerUrl = logReferences.serverUrl;
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

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"newLog"} onClick={onClickNewLog}>
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
        </MenuItem>
      ]}
    />
  );
};

export default LogsContextMenu;
