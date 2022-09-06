import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { parseStringToRigReferences } from "../../models/jobs/copyRigJob";
import { DeleteRigsJob } from "../../models/jobs/deleteJobs";
import RigReferences from "../../models/jobs/rigReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import Rig from "../../models/rig";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const useClipboardRigReferences: () => [RigReferences | null, Dispatch<SetStateAction<RigReferences>>] = () => {
  const [rigReferences, setRigReferences] = useState<RigReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const rigReferences = parseStringToRigReferences(clipboardText);
        setRigReferences(rigReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [rigReferences, setRigReferences];
};

export const orderCopyJob = (wellbore: Wellbore, rigReferences: RigReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: rigReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyRig, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const deleteRig = async (rigs: Rig[], dispatchOperation: DispatchOperation) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job: DeleteRigsJob = {
    toDelete: {
      rigUids: rigs.map((rig) => rig.uid),
      wellUid: rigs[0].wellUid,
      wellboreUid: rigs[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteRigs, job);
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, rigs: Rig[], dispatchOperation: DispatchOperation) => {
  const rigReferences: RigReferences = {
    serverUrl: selectedServer.url,
    rigUids: rigs.map((rig) => rig.uid),
    wellUid: rigs[0].wellUid,
    wellboreUid: rigs[0].wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(rigReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};
