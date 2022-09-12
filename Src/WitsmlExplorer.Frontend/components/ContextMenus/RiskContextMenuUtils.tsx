import OperationType from "../../contexts/operationType";
import { DeleteRisksJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ObjectType } from "../../models/objectType";
import Risk from "../../models/riskObject";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import ConfirmModal from "../Modals/ConfirmModal";
import { DispatchOperation } from "./ContextMenuUtils";

export const deleteRisk = async (risks: Risk[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteRisksJob = {
    toDelete: {
      objectUids: risks.map((risk) => risk.uid),
      wellUid: risks[0].wellUid,
      wellboreUid: risks[0].wellboreUid,
      objectType: ObjectType.Risk
    }
  };
  await JobService.orderJob(JobType.DeleteRisks, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, risks: Risk[], dispatchOperation: DispatchOperation) => {
  const riskReferences: ObjectReferences = {
    serverUrl: selectedServer.url,
    objectUids: risks.map((risk) => risk.uid),
    wellUid: risks[0].wellUid,
    wellboreUid: risks[0].wellboreUid,
    objectType: ObjectType.Risk
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
