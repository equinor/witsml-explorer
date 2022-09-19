import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OperationType from "../../contexts/operationType";
import { parseStringToTubularComponentReferences, TubularComponentReferences } from "../../models/jobs/copyTubularComponentJob";
import TubularReference from "../../models/jobs/tubularReference";
import Tubular from "../../models/tubular";
import JobService, { JobType } from "../../services/jobService";
import { DispatchOperation } from "./ContextMenuUtils";

export const useClipboardTubularComponentReferences: () => [TubularComponentReferences | null, Dispatch<SetStateAction<TubularComponentReferences>>] = () => {
  const [tubularComponentReferences, setTubularComponentReferences] = useState<TubularComponentReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const tubularComponentReferences = parseStringToTubularComponentReferences(clipboardText);
        setTubularComponentReferences(tubularComponentReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return [tubularComponentReferences, setTubularComponentReferences];
};

export const orderCopyTubularComponentsJob = (tubular: Tubular, tubularComponentReferences: TubularComponentReferences, dispatchOperation: DispatchOperation) => {
  const tubularReference: TubularReference = {
    wellUid: tubular.wellUid,
    wellboreUid: tubular.wellboreUid,
    tubularUid: tubular.uid
  };

  const copyJob = { source: tubularComponentReferences, target: tubularReference };
  JobService.orderJob(JobType.CopyTubularComponents, copyJob);
  dispatchOperation({ type: OperationType.HideContextMenu });
};
