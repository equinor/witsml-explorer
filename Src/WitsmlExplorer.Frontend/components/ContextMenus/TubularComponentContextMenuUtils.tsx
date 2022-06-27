import { Dispatch, SetStateAction, useState, useEffect } from "react";
import OperationType from "../../contexts/operationType";
import { parseStringToTubularComponentReferences, TubularComponentReferences } from "../../models/jobs/copyTubularComponentJob";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import { DispatchOperation } from "./TubularContextMenuUtils";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import React from "react";
import TubularReference from "../../models/jobs/tubularReference";
import Tubular from "../../models/tubular";

export const useClipboardTubularComponentReferences: () => [TubularComponentReferences | null, Dispatch<SetStateAction<TubularComponentReferences>>] = () => {
  const [tubularComponentReferences, setTubularComponentReferences] = useState<TubularComponentReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const tubularComponentReferences = parseStringToTubularComponentReferences(clipboardText);
        setTubularComponentReferences(tubularComponentReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [tubularComponentReferences, setTubularComponentReferences];
};

export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, tubular: Tubular, tubularComponentReferences: TubularComponentReferences) => {
  const onConnectionVerified = async (credentials: ServerCredentials) => {
    await CredentialsService.saveCredentials(credentials);
    orderCopyJob(tubular, tubularComponentReferences, dispatchOperation);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: `You are trying to paste tubular components from a server that you are not logged in to. Please provide username and password for ${server.name}.`,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};

export const orderCopyJob = (tubular: Tubular, tubularComponentReferences: TubularComponentReferences, dispatchOperation: DispatchOperation) => {
  const tubularReference: TubularReference = {
    wellUid: tubular.wellUid,
    wellboreUid: tubular.wellboreUid,
    tubularUid: tubular.uid
  };

  const copyJob = { source: tubularComponentReferences, target: tubularReference };
  JobService.orderJob(JobType.CopyTubularComponents, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickPaste = async (servers: Server[], dispatchOperation: DispatchOperation, tubular: Tubular, tubularComponentReferences: TubularComponentReferences) => {
  const sourceServer = servers.find((server) => server.url === tubularComponentReferences.serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      showCredentialsModal(sourceServer, dispatchOperation, tubular, tubularComponentReferences);
    } else {
      orderCopyJob(tubular, tubularComponentReferences, dispatchOperation);
    }
  }
};
