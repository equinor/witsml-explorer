import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OperationType from "../../contexts/operationType";
import { parseStringToTubularReferences } from "../../models/jobs/copyTubularJob";
import { Server } from "../../models/server";
import CredentialsService, { ServerCredentials } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import React from "react";
import WellboreReference from "../../models/jobs/wellboreReference";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import TubularService from "../../services/tubularService";
import Tubular from "../../models/tubular";
import { UpdateWellboreTubularAction } from "../../contexts/navigationStateReducer";
import ModificationType from "../../contexts/modificationType";
import ConfirmModal from "../Modals/ConfirmModal";
import TubularReferences from "../../models/jobs/tubularReferences";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardTubularReferences: () => [TubularReferences | null, Dispatch<SetStateAction<TubularReferences>>] = () => {
  const [tubularReferences, setTubularReferences] = useState<TubularReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const tubularReferences = parseStringToTubularReferences(clipboardText);
        setTubularReferences(tubularReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [tubularReferences, setTubularReferences];
};

export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, wellbore: Wellbore, tubularReferences: TubularReferences) => {
  const onConnectionVerified = async (credentials: ServerCredentials) => {
    await CredentialsService.saveCredentials(credentials);
    orderCopyJob(wellbore, tubularReferences, dispatchOperation);
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

export const orderCopyJob = (wellbore: Wellbore, tubularReferences: TubularReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: tubularReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyTubular, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickPaste = async (servers: Server[], dispatchOperation: DispatchOperation, wellbore: Wellbore, tubularReferences: TubularReferences) => {
  const sourceServer = servers.find((server) => server.url === tubularReferences.serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      showCredentialsModal(sourceServer, dispatchOperation, wellbore, tubularReferences);
    } else {
      orderCopyJob(wellbore, tubularReferences, dispatchOperation);
    }
  }
};

export const deleteTubular = async (tubulars: Tubular[], dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job = {
    tubularReferences: {
      tubularUids: tubulars.map((tubular) => tubular.uid),
      wellUid: tubulars[0].wellUid,
      wellboreUid: tubulars[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteTubular, job);
  const freshTubulars = await TubularService.getTubulars(job.tubularReferences.wellUid, job.tubularReferences.wellboreUid);
  dispatchNavigation({
    type: ModificationType.UpdateTubularsOnWellbore,
    payload: {
      wellUid: job.tubularReferences.wellUid,
      wellboreUid: job.tubularReferences.wellboreUid,
      tubulars: freshTubulars
    }
  });
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, tubulars: Tubular[], dispatchOperation: DispatchOperation) => {
  const tubularReferences: TubularReferences = {
    serverUrl: selectedServer.url,
    tubularUids: tubulars.map((tubular) => tubular.uid),
    wellUid: tubulars[0].wellUid,
    wellboreUid: tubulars[0].wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(tubularReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDelete = async (tubulars: Tubular[], dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete tubular?"}
      content={
        <span>
          This will permanently delete tubulars: <strong>{tubulars.map((item) => item.uid).join(", ")}</strong>
        </span>
      }
      onConfirm={() => deleteTubular(tubulars, dispatchOperation, dispatchNavigation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
