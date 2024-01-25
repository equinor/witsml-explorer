import NavigationContext from "contexts/navigationContext";
import { useSnackbar } from "notistack";
import React, { useContext, useEffect } from "react";
import NotificationService from "services/notificationService";

const Snackbar = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();
  const { navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        (notification) => {
          const shouldNotify =
            notification.serverUrl.toString().toLowerCase() ===
            navigationState.selectedServer?.url?.toLowerCase();
          if (shouldNotify) {
            enqueueSnackbar(notification.message, {
              variant: notification.isSuccess ? "success" : "error"
            });
          }
        }
      );

    return function cleanup() {
      unsubscribe();
    };
  }, [navigationState.selectedServer]);

  return <></>;
};

export default Snackbar;
