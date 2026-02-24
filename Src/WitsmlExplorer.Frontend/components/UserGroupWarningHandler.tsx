import { useOperationState } from "hooks/useOperationState";
import { ReactElement, useEffect } from "react";

import NotificationService from "services/notificationService.ts";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  STORAGE_VIEW_USER_GROUP_WARNING_KEY
} from "tools/localStorageHelpers";
import { UserRole } from "contexts/operationStateReducer.tsx";

export function UserGroupWarningHandler(): ReactElement {
  const {
    operationState: { userRole }
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

  useEffect(() => {
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
  }, []);

  return null;
}
