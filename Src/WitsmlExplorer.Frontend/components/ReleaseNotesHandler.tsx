import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ReactElement, useEffect } from "react";
import jsonData from "../components/Modals/releaseNotes.json";
import ReleaseNotesModal, { ReleaseNote } from "./Modals/ReleaseNotesModal.tsx";

import NotificationService from "services/notificationService.ts";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  STORAGE_LAST_VIEWED_FEATURE_KEY,
  STORAGE_VIEW_USER_GROUP_WARNING_KEY
} from "tools/localStorageHelpers";
import { UserRole } from "contexts/operationStateReducer.tsx";

export function ReleaseNotesHandler(): ReactElement {
  const {
    operationState: { userRole },
    dispatchOperation
  } = useOperationState();

  const getUserGroupWarning = (): boolean => {
    const userGroupWarning = getLocalStorageItem<boolean>(
      STORAGE_VIEW_USER_GROUP_WARNING_KEY,
      { defaultValue: false }
    );
    return userGroupWarning;
  };

  const setUserGroupWarning = (userGroupWarning: boolean) => {
    setLocalStorageItem<boolean>(
      STORAGE_VIEW_USER_GROUP_WARNING_KEY,
      userGroupWarning
    );
  };

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
    const showUserWarning = getUserGroupWarning();

    if (userRole == UserRole.Regular) {
      if (showUserWarning) {
        NotificationService.Instance.snackbarDispatcher.dispatch({
          serverUrl: null,
          message:
            "User has assigned an user role  with limited access - Regular User. You can change it in Settings.",
          isSuccess: true,
          severity: "warning"
        });
        setUserGroupWarning(false);
      } else setUserGroupWarning(true);
    }

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
