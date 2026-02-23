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
          const hasConnectedServer = connectedServerUrl != null;
          const notificationHasNoServer = notificationServerUrl == null;

          const noConnectedServerAndNoNotificationServer =
            !hasConnectedServer && notificationHasNoServer;

          const connectedServerMatchesNotificationServer =
            hasConnectedServer &&
            (notificationHasNoServer ||
              connectedServerUrl === notificationServerUrl ||
              connectedServerUrl === notificationSourceServerUrl);

          const shouldNotify =
            noConnectedServerAndNoNotificationServer ||
            connectedServerMatchesNotificationServer;

          if (shouldNotify) {
            enqueueSnackbar(notification.message, {
              variant: notification.isSuccess
                ? notification.severity == "warning"
                  ? "warning"
                  : "success"
                : "error"
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
