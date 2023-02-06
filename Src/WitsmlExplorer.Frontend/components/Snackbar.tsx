import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import NotificationService from "../services/notificationService";

const Snackbar = (): React.ReactElement => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const unsubscribe = NotificationService.Instance.snackbarDispatcherAsEvent.subscribe((notification) => {
      enqueueSnackbar(notification.message, {
        variant: notification.isSuccess ? "success" : "error"
      });
    });

    return function cleanup() {
      unsubscribe();
    };
  }, []);

  return <></>;
};

export default Snackbar;
