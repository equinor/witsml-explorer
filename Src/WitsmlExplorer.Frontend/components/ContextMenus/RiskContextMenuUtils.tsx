import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { parseStringToRiskReferences } from "../../models/jobs/copyRiskJob";
import { DeleteRisksJob } from "../../models/jobs/deleteJobs";
import RiskReferences from "../../models/jobs/riskReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import Risk from "../../models/riskObject";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import ConfirmModal from "../Modals/ConfirmModal";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardRiskReferences: () => [RiskReferences | null, Dispatch<SetStateAction<RiskReferences>>] = () => {
  const [riskReferences, setRiskReferences] = useState<RiskReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const riskReferences = parseStringToRiskReferences(clipboardText);
        setRiskReferences(riskReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [riskReferences, setRiskReferences];
};

export const orderCopyJob = (wellbore: Wellbore, riskReferences: RiskReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: riskReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyRisk, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const deleteRisk = async (risks: Risk[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteRisksJob = {
    toDelete: {
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
    serverUrl: selectedServer.url,
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
