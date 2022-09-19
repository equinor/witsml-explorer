import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreTubularAction, UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteTubularsJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import JobService, { JobType } from "../../services/jobService";
import TubularService from "../../services/tubularService";
import ConfirmModal from "../Modals/ConfirmModal";
import { DispatchOperation } from "./ContextMenuUtils";

export const deleteTubular = async (tubulars: Tubular[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteTubularsJob = {
    toDelete: {
      objectUids: tubulars.map((tubular) => tubular.uid),
      wellUid: tubulars[0].wellUid,
      wellboreUid: tubulars[0].wellboreUid,
      objectType: ObjectType.Tubular
    }
  };
  await JobService.orderJob(JobType.DeleteTubulars, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, tubulars: Tubular[], dispatchOperation: DispatchOperation) => {
  const tubularReferences: ObjectReferences = {
    serverUrl: selectedServer.url,
    objectUids: tubulars.map((tubular) => tubular.uid),
    wellUid: tubulars[0].wellUid,
    wellboreUid: tubulars[0].wellboreUid,
    objectType: ObjectType.Tubular
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
