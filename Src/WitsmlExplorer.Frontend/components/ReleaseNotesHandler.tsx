import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ReactElement, useEffect } from "react";
import ReleaseNotesModal, { ReleaseNote } from "./Modals/ReleaseNotesModal.tsx";
import jsonData from "../components/Modals/releaseNotes.json";

import {
  setLocalStorageItem,
  STORAGE_LAST_ADDED_FEATURE_KEY
} from "tools/localStorageHelpers";

export function ReleaseNotesHandler(): ReactElement {
  const {
    operationState: { lastAddedFeature },
    dispatchOperation
  } = useOperationState();

  const openReleaseNotes = () => {
    const firstFeature = jsonData.map((obj: ReleaseNote) => obj.feature)[0];

    if (firstFeature === lastAddedFeature) {
      setLastAddedFeature(firstFeature);
    } else {
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReleaseNotesModal />
      });
    }
  };

  const setLastAddedFeature = (lastAddedFeature: string) => {
    setLocalStorageItem<string>(
      STORAGE_LAST_ADDED_FEATURE_KEY,
      lastAddedFeature
    );
    dispatchOperation({
      type: OperationType.SetLastAddedFeature,
      payload: lastAddedFeature
    });
  };

  useEffect(() => {
    openReleaseNotes();
  }, []);

  return null;
}
