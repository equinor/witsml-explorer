import { useConnectedServer } from "contexts/connectedServerContext";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import NotificationService from "services/notificationService";

export function Snackbar() {
  const { enqueueSnackbar } = useSnackbar();
  const { connectedServer } = useConnectedServer();

  useEffect(() => {
    const unsubscribe =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        (notification) => {
          const shouldNotify =
            notification.serverUrl.toString().toLowerCase() ===
            connectedServer?.url?.toLowerCase();
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
  }, [connectedServer]);

  return <></>;
}
