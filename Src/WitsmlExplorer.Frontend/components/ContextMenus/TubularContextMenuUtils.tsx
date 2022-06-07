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
import TubularService from "../../services/tubularService";
import Tubular from "../../models/tubular";
import { UpdateWellboreTubularAction } from "../../contexts/navigationStateReducer";
import ModificationType from "../../contexts/modificationType";
import ConfirmModal from "../Modals/ConfirmModal";

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

export const deleteTubular = async (tubular: Tubular, dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job = {
    tubularReference: {
      wellUid: tubular.wellUid,
      wellboreUid: tubular.wellboreUid,
      tubularUid: tubular.uid
    }
  };
  await JobService.orderJob(JobType.DeleteTubular, job);
  const freshTubulars = await TubularService.getTubulars(job.tubularReference.wellUid, job.tubularReference.wellboreUid);
  dispatchNavigation({
    type: ModificationType.UpdateTubularOnWellbore,
    payload: {
      wellUid: job.tubularReference.wellUid,
      wellboreUid: job.tubularReference.wellboreUid,
      tubulars: freshTubulars
    }
  });
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, tubular: Tubular, dispatchOperation: DispatchOperation) => {
  const tubularReference: TubularReference = {
    serverUrl: selectedServer.url,
    tubularUid: tubular.uid,
    wellUid: tubular.wellUid,
    wellboreUid: tubular.wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(tubularReference));
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDelete = async (tubular: Tubular, dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete tubular?"}
      content={
        <span>
          This will permanently delete <strong>{tubular.name}</strong>
        </span>
      }
      onConfirm={() => deleteTubular(tubular, dispatchOperation, dispatchNavigation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
