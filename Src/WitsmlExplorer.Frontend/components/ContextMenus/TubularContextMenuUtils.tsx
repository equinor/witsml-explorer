import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreTubularAction, UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import OperationType from "../../contexts/operationType";
import { parseStringToTubularReferences } from "../../models/jobs/copyTubularJob";
import { DeleteTubularsJob } from "../../models/jobs/deleteJobs";
import TubularReferences from "../../models/jobs/tubularReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import TubularService from "../../services/tubularService";
import ConfirmModal from "../Modals/ConfirmModal";
import { DispatchOperation } from "./ContextMenuUtils";

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

export const orderCopyJob = (wellbore: Wellbore, tubularReferences: TubularReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: tubularReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyTubular, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const deleteTubular = async (tubulars: Tubular[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteTubularsJob = {
    toDelete: {
      tubularUids: tubulars.map((tubular) => tubular.uid),
      wellUid: tubulars[0].wellUid,
      wellboreUid: tubulars[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteTubulars, job);
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

export const onClickDelete = async (tubulars: Tubular[], dispatchOperation: DispatchOperation) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete tubular?"}
      content={
        <span>
          This will permanently delete tubulars: <strong>{tubulars.map((item) => item.uid).join(", ")}</strong>
        </span>
      }
      onConfirm={() => deleteTubular(tubulars, dispatchOperation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};

export const onClickShowOnServer = async (dispatchOperation: DispatchOperation, server: Server, wellUid: string, wellboreUid: string, tubularUid: string) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  const logUrl = `${host}/?serverUrl=${server.url}&wellUid=${wellUid}&wellboreUid=${wellboreUid}&tubularUid=${tubularUid}`;
  window.open(logUrl);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickRefresh = async (tubular: Tubular, dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreTubularAction) => void) => {
  let freshTubular = await TubularService.getTubular(tubular.wellUid, tubular.wellboreUid, tubular.uid);
  const exists = !!freshTubular;
  if (!exists) {
    freshTubular = tubular;
  }
  dispatchNavigation({
    type: ModificationType.UpdateTubularOnWellbore,
    payload: { tubular: freshTubular, exists: exists }
  });
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickRefreshAll = async (
  wellUid: string,
  wellboreUid: string,
  dispatchOperation: DispatchOperation,
  dispatchNavigation: (action: UpdateWellboreTubularsAction) => void
) => {
  const tubulars = await TubularService.getTubulars(wellUid, wellboreUid);
  dispatchNavigation({ type: ModificationType.UpdateTubularsOnWellbore, payload: { tubulars, wellUid, wellboreUid } });
  dispatchOperation({ type: OperationType.HideContextMenu });
};
