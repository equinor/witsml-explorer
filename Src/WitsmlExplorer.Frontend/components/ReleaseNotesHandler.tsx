import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ReactElement, useEffect } from "react";
import jsonData from "../components/Modals/releaseNotes.json";
import ReleaseNotesModal, { ReleaseNote } from "./Modals/ReleaseNotesModal.tsx";

import {
  getLocalStorageItem,
  setLocalStorageItem,
  STORAGE_LAST_VIEWED_FEATURE_KEY
} from "tools/localStorageHelpers";

export function ReleaseNotesHandler(): ReactElement {
  const { dispatchOperation } = useOperationState();

  const getLastViewedFeature = (): string => {
    const lastViewedFeature = getLocalStorageItem<string>(
      STORAGE_LAST_VIEWED_FEATURE_KEY,
      { defaultValue: null }
    );
    return lastViewedFeature;
  };

  const setLastViewedFeature = (lastViewedFeature: string) => {
    setLocalStorageItem<string>(
      STORAGE_LAST_VIEWED_FEATURE_KEY,
      lastViewedFeature
    );
  };

  useEffect(() => {
    const lastFeature = jsonData.map((obj: ReleaseNote) => obj.feature)[0];
    const lastViewedFeature = getLastViewedFeature();

    if (lastFeature !== lastViewedFeature) {
      setLastViewedFeature(lastFeature);
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReleaseNotesModal />
      });
    }
  }, []);

  return null;
}
