import { useSnackbar } from "notistack";
import React, { useContext, useEffect } from "react";
import NavigationContext from "../contexts/navigationContext";
import NotificationService from "../services/notificationService";

const Snackbar = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();
  const { navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.snackbarDispatcherAsEvent.subscribe((notification) => {
      //TODO should notify if the user is equal to the socket user
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
