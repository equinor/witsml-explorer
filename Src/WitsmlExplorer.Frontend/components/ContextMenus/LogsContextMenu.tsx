import React, { useEffect, useState } from "react";
import Wellbore from "../../models/wellbore";
import LogObject from "../../models/logObject";
import { v4 as uuid } from "uuid";
import LogPropertiesModal, { IndexCurve, LogPropertiesModalInterface } from "../Modals/LogPropertiesModal";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import { NewIcon, PasteIcon } from "../Icons";
import ContextMenu from "./ContextMenu";
import JobService, { JobType } from "../../services/jobService";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import { parseStringToLogReference } from "../../models/jobs/copyLogJob";
import LogReference from "../../models/jobs/logReference";
import { Server } from "../../models/server";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import WellboreReference from "../../models/jobs/wellboreReference";
import { PropertiesModalMode } from "../Modals/ModalParts";

export interface LogsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  wellbore: Wellbore;
  servers: Server[];
  indexCurve: IndexCurve;
}

const LogsContextMenu = (props: LogsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, indexCurve } = props;
  const [logReference, setLogReference] = useState<LogReference>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const logReference = parseStringToLogReference(clipboardText);
        setLogReference(logReference);
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

    const copyJob = { source: logReference, target: wellboreReference };
    JobService.orderJob(jobType, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const showCredentialsModal = (jobType: JobType, server: Server, errorMessage: string) => {
    const onConnectionVerified = async (credentials: ServerCredentials) => {
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
    const sourceServerUrl = logReference.serverUrl;
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
            <NewIcon />
          </ListItemIcon>
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <MenuItem key={"pasteLog"} onClick={() => onClickPaste(JobType.CopyLog)} disabled={logReference === null}>
          <ListItemIcon>
            <PasteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Paste log</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogsContextMenu;
