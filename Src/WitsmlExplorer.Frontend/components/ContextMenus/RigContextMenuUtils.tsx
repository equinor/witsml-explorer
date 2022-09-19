import OperationType from "../../contexts/operationType";
import { DeleteRigsJob } from "../../models/jobs/deleteJobs";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ObjectType } from "../../models/objectType";
import Rig from "../../models/rig";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import { DispatchOperation } from "./ContextMenuUtils";

export const deleteRig = async (rigs: Rig[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteRigsJob = {
    toDelete: {
      objectUids: rigs.map((rig) => rig.uid),
      wellUid: rigs[0].wellUid,
      wellboreUid: rigs[0].wellboreUid,
      objectType: ObjectType.Rig
    }
  };
  await JobService.orderJob(JobType.DeleteRigs, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, rigs: Rig[], dispatchOperation: DispatchOperation) => {
  const rigReferences: ObjectReferences = {
    serverUrl: selectedServer.url,
    objectUids: rigs.map((rig) => rig.uid),
    wellUid: rigs[0].wellUid,
    wellboreUid: rigs[0].wellboreUid,
    objectType: ObjectType.Rig
  };
  await navigator.clipboard.writeText(JSON.stringify(rigReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};
