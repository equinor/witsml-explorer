import React, { useEffect, useContext } from "react";
import { useSnackbar } from "notistack";
import NotificationService from "../services/notificationService";
import NavigationContext from "../contexts/navigationContext";

const Snackbar = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();
  const { navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.snackbarDispatcher.subscribe((notification) => {
      const shouldNotify = notification.serverUrl.toString() === navigationState.selectedServer?.url;
      if (shouldNotify) {
        enqueueSnackbar(notification.message, {
          variant: notification.isSuccess ? "success" : "error"
        });
      }
    });

    return function cleanup() {
      unsubscribe();
    };
  }, [navigationState.selectedServer]);

  return <></>;
};

export default Snackbar;
