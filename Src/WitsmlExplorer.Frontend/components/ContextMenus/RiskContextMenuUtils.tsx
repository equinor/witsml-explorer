import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import React from "react";
import Risk from "../../models/riskObject";
import RiskReferences from "../../models/jobs/riskReferences";
import ConfirmModal from "../Modals/ConfirmModal";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { DeleteRisksJob } from "../../models/jobs/deleteJobs";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const deleteRisk = async (risks: Risk[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteRisksJob = {
    source: {
      riskUids: risks.map((risk) => risk.uid),
      wellUid: risks[0].wellUid,
      wellboreUid: risks[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteRisks, job);
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

export const onClickDelete = async (risks: Risk[], dispatchOperation: DispatchOperation) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete risk?"}
      content={
        <span>
          This will permanently delete risks: <strong>{risks.map((item) => item.uid).join(", ")}</strong>
        </span>
      }
      onConfirm={() => deleteRisk(risks, dispatchOperation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
