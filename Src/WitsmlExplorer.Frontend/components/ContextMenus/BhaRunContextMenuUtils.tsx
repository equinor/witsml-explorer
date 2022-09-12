import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OperationType from "../../contexts/operationType";
import BhaRunReferences from "../../models/jobs/bhaRunReferences";
import { parseStringToBhaRunReferences } from "../../models/jobs/copyBhaRunJob";
import WellboreReference from "../../models/jobs/wellboreReference";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { DispatchOperation } from "./ContextMenuUtils";

export const useClipboardBhaRunReferences: () => [BhaRunReferences | null, Dispatch<SetStateAction<BhaRunReferences>>] = () => {
  const [bhaRunReferences, setBhaRunReferences] = useState<BhaRunReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const bhaRunReferences = parseStringToBhaRunReferences(clipboardText);
        setBhaRunReferences(bhaRunReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [bhaRunReferences, setBhaRunReferences];
};

export const orderCopyJob = (wellbore: Wellbore, bhaRunReferences: BhaRunReferences, dispatchOperation: DispatchOperation) => {
  const wellboreReference: WellboreReference = {
    wellUid: wellbore.wellUid,
    wellboreUid: wellbore.uid
  };

  const copyJob = { source: bhaRunReferences, target: wellboreReference };
  JobService.orderJob(JobType.CopyBhaRun, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};
