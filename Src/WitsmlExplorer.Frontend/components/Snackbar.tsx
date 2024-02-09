import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import NotificationService from "../services/notificationService";

export function Snackbar() {
  const { enqueueSnackbar } = useSnackbar();
  const { authorizationState } = useAuthorizationState();

  useEffect(() => {
    const unsubscribe =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        (notification) => {
          const shouldNotify =
            notification.serverUrl.toString().toLowerCase() ===
            authorizationState?.server?.url?.toLowerCase();
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
  }, [authorizationState]);

  return <></>;
}
