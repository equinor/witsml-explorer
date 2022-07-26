import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import React from "react";
import Risk from "../../models/riskObject";
import RiskService from "../../services/riskObjectService";
import ModificationType from "../../contexts/modificationType";
import RiskReferences from "../../models/jobs/riskReferences";
import { UpdateWellboreRisksAction } from "../../contexts/navigationStateReducer";
import ConfirmModal from "../Modals/ConfirmModal";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const deleteRisk = async (risks: Risk[], dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreRisksAction) => void) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job = {
    riskReferences: {
      riskUids: risks.map((risk) => risk.uid),
      wellUid: risks[0].wellUid,
      wellboreUid: risks[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteRisks, job);
  const freshRisks = await RiskService.getRisks(job.riskReferences.wellUid, job.riskReferences.wellboreUid);
  dispatchNavigation({
    type: ModificationType.UpdateRiskObjects,
    payload: {
      wellUid: job.riskReferences.wellUid,
      wellboreUid: job.riskReferences.wellboreUid,
      risks: freshRisks
    }
  });
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, risks: Risk[], dispatchOperation: DispatchOperation) => {
  const riskReferences: RiskReferences = {
    riskUids: risks.map((risk) => risk.uid),
    wellUid: risks[0].wellUid,
    wellboreUid: risks[0].wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(riskReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDelete = async (risks: Risk[], dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreRisksAction) => void) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete risk?"}
      content={
        <span>
          This will permanently delete risks: <strong>{risks.map((item) => item.uid).join(", ")}</strong>
        </span>
      }
      onConfirm={() => deleteRisk(risks, dispatchOperation, dispatchNavigation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
