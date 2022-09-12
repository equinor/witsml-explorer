import { useSnackbar } from "notistack";
import React, { useContext, useEffect } from "react";
import NavigationContext from "../contexts/navigationContext";
import CredentialsService from "../services/credentialsService";
import NotificationService from "../services/notificationService";

const Snackbar = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();
  const { navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.snackbarDispatcher.subscribe((notification) => {
      const shouldNotify = CredentialsService.hasPasswordForUrl(notification.serverUrl.toString());
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
