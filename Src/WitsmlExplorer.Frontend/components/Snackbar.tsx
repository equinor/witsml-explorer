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
          const connectedServerUrl = connectedServer?.url?.toLowerCase();
          const notificationServerUrl = notification.serverUrl
            ?.toString()
            .toLowerCase();
          const notificationSourceServerUrl = notification.sourceServerUrl
            ?.toString()
            .toLowerCase();
          const shouldNotify =
            connectedServerUrl &&
            (notificationServerUrl === null ||
              connectedServerUrl === notificationServerUrl ||
              connectedServerUrl === notificationSourceServerUrl);
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
