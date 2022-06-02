import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OperationType from "../../contexts/operationType";
import { parseStringToTubularReference } from "../../models/jobs/copyTubularJob";
import TubularReference from "../../models/jobs/tubularReference";
import { Server } from "../../models/server";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import React from "react";
import WellboreReference from "../../models/jobs/wellboreReference";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardTubularReference: () => [TubularReference | null, Dispatch<SetStateAction<TubularReference>>] = () => {
  const [tubularReference, setTubularReference] = useState<TubularReference>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const tubularReference = parseStringToTubularReference(clipboardText);
        setTubularReference(tubularReference);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [tubularReference, setTubularReference];
};

export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, wellbore: Wellbore, tubularReference: TubularReference) => {
  const onConnectionVerified = async (credentials: ServerCredentials) => {
    await CredentialsService.saveCredentials(credentials);
    orderCopyJob(wellbore, tubularReference, dispatchOperation);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: `You are trying to paste a tubular from a server that you are not logged in to. Please provide username and password for ${server.name}.`,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};

export const orderCopyJob = (wellbore: Wellbore, tubularReference: TubularReference, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: tubularReference, target: wellboreReference };
  JobService.orderJob(JobType.CopyTubular, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickPaste = async (servers: Server[], dispatchOperation: DispatchOperation, wellbore: Wellbore, tubularReference: TubularReference) => {
  const sourceServer = servers.find((server) => server.url === tubularReference.serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      showCredentialsModal(sourceServer, dispatchOperation, wellbore, tubularReference);
    } else {
      orderCopyJob(wellbore, tubularReference, dispatchOperation);
    }
  }
};
