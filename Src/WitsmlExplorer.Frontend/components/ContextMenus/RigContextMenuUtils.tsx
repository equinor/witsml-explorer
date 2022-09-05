import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { parseStringToRigReferences } from "../../models/jobs/copyRigJob";
import { DeleteRigsJob } from "../../models/jobs/deleteJobs";
import RigReferences from "../../models/jobs/rigReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import Rig from "../../models/rig";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardRigReferences: () => [RigReferences | null, Dispatch<SetStateAction<RigReferences>>] = () => {
  const [rigReferences, setRigReferences] = useState<RigReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const rigReferences = parseStringToRigReferences(clipboardText);
        setRigReferences(rigReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [rigReferences, setRigReferences];
};

export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, wellbore: Wellbore, rigReferences: RigReferences) => {
  const onConnectionVerified = async (credentials: BasicServerCredentials) => {
    await CredentialsService.saveCredentials(credentials);
    orderCopyJob(wellbore, rigReferences, dispatchOperation);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: `You are trying to paste a rig from a server that you are not logged in to. Please provide username and password for ${server.name}.`,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};

export const orderCopyJob = (wellbore: Wellbore, rigReferences: RigReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: rigReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyRig, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickPaste = async (servers: Server[], dispatchOperation: DispatchOperation, wellbore: Wellbore, rigReferences: RigReferences) => {
  const sourceServer = servers.find((server) => server.url === rigReferences.serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      showCredentialsModal(sourceServer, dispatchOperation, wellbore, rigReferences);
    } else {
      orderCopyJob(wellbore, rigReferences, dispatchOperation);
    }
  }
};

export const deleteRig = async (rigs: Rig[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteRigsJob = {
    toDelete: {
      rigUids: rigs.map((rig) => rig.uid),
      wellUid: rigs[0].wellUid,
      wellboreUid: rigs[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteRigs, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, rigs: Rig[], dispatchOperation: DispatchOperation) => {
  const rigReferences: RigReferences = {
    serverUrl: selectedServer.url,
    rigUids: rigs.map((rig) => rig.uid),
    wellUid: rigs[0].wellUid,
    wellboreUid: rigs[0].wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(rigReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};
