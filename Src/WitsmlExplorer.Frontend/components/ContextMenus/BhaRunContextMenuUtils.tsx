import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import BhaRunReferences from "../../models/jobs/bhaRunReferences";
import { parseStringToBhaRunReferences } from "../../models/jobs/copyBhaRunJob";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

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
