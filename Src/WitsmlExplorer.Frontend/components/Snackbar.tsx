import { useConnectedServer } from "contexts/connectedServerContext";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import NotificationService from "services/notificationService";
import styled from "styled-components";

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
            const variant = notification.isSuccess
              ? notification.severity == "warning"
                ? "warning"
                : "success"
              : "error";
            enqueueSnackbar(
              variant === "success" ? (
                <SingleLineMessage title={notification.message}>
                  {notification.message}
                </SingleLineMessage>
              ) : (
                notification.message
              ),
              { variant }
            );
          }
        }
      );

    return function cleanup() {
      unsubscribe();
    };
  }, [connectedServer]);

  return <></>;
}

const SingleLineMessage = styled.span`
  display: block;
  min-width: 0;
  max-width: min(600px, calc(100vw - 120px));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
