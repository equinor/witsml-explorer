import { useOperationState } from "hooks/useOperationState";
import { ReactElement, useEffect } from "react";

import { UserRole } from "contexts/operationStateReducer.tsx";
import NotificationService from "services/notificationService.ts";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  STORAGE_SHOW_USER_GROUP_WARNING_KEY
} from "tools/localStorageHelpers";

export function UserGroupWarningHandler(): ReactElement {
  const {
    operationState: { userRole }
  } = useOperationState();

  const getShowUserGroupWarning = (): boolean => {
    const showUserGroupWarning = getLocalStorageItem<boolean>(
      STORAGE_SHOW_USER_GROUP_WARNING_KEY,
      { defaultValue: true, useSessionStorage: true }
    );
    return showUserGroupWarning;
  };

  const setShowUserGroupWarning = (showUserGroupWarning: boolean) => {
    setLocalStorageItem<boolean>(
      STORAGE_SHOW_USER_GROUP_WARNING_KEY,
      showUserGroupWarning,
      { useSessionStorage: true }
    );
  };

  useEffect(() => {
    setTimeout(() => {
      const showUserWarning = getShowUserGroupWarning();

      if (userRole == UserRole.Regular && showUserWarning) {
        setShowUserGroupWarning(false);
        NotificationService.Instance.snackbarDispatcher.dispatch({
          serverUrl: null,
          message:
            "Your account is currently set to the Regular User role, which has limited access. You can change this in Settings.",
          isSuccess: true,
          severity: "warning"
        });
      }
    }, 500);
  }, []);

  return null;
}
