import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import BhaRunReferences from "../../models/jobs/bhaRunReferences";
import { parseStringToBhaRunReferences } from "../../models/jobs/copyBhaRunJob";
import WellboreReference from "../../models/jobs/wellboreReference";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardBhaRunReferences: () => [BhaRunReferences | null, Dispatch<SetStateAction<BhaRunReferences>>] = () => {
  const [bhaRunReferences, setBhaRunReferences] = useState<BhaRunReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const bhaRunReferences = parseStringToBhaRunReferences(clipboardText);
        setBhaRunReferences(bhaRunReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [bhaRunReferences, setBhaRunReferences];
};

export const onClickPaste = async (servers: Server[], dispatchOperation: DispatchOperation, wellbore: Wellbore, bhaRunReferences: BhaRunReferences) => {
  const sourceServer = servers.find((server) => server.url === bhaRunReferences.serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      showCredentialsModal(sourceServer, dispatchOperation, wellbore, bhaRunReferences);
    } else {
      orderCopyJob(wellbore, bhaRunReferences, dispatchOperation);
    }
  }
};

const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, wellbore: Wellbore, bhaRunReferences: BhaRunReferences) => {
  const onConnectionVerified = async (credentials: BasicServerCredentials) => {
    await CredentialsService.saveCredentials(credentials);
    orderCopyJob(wellbore, bhaRunReferences, dispatchOperation);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: `You are trying to paste a bhaRun from a server that you are not logged in to. Please provide username and password for ${server.name}.`,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};

const orderCopyJob = (wellbore: Wellbore, bhaRunReferences: BhaRunReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: bhaRunReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyBhaRun, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};
