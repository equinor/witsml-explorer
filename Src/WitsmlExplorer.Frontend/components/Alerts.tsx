import { Icon } from "@equinor/eds-core-react";
import { Alert, AlertTitle, Collapse } from "@mui/material";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useOperationState } from "hooks/useOperationState";
import { capitalize } from "lodash";
import React, { useEffect, useState } from "react";
import NotificationService from "services/notificationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";

interface AlertState {
  severity?: AlertSeverity;
  content: string | React.ReactNode;
}

export type AlertSeverity = "error" | "info" | "success" | "warning";

const Alerts = (): React.ReactElement => {
  const [alert, setAlert] = useState<AlertState>(null);
  const { connectedServer } = useConnectedServer();
  const {
    operationState: { colors }
  } = useOperationState();

  useEffect(() => {
    const unsubscribeOnConnectionStateChanged =
      NotificationService.Instance.onConnectionStateChanged.subscribe(
        (connected) => {
          if (connected) {
            setAlert(null);
          } else {
            setAlert({
              content:
                "Lost connection to notifications service. Please wait for reconnection or refresh browser"
            });
          }
        }
      );
    const unsubscribeOnJobFinished =
      NotificationService.Instance.alertDispatcherAsEvent.subscribe(
        (notification) => {
          const connectedServerUrl = connectedServer?.url?.toLowerCase();
          const notificationServerUrl = notification.serverUrl
            ?.toString()
            .toLowerCase();
          const notificationSourceServerUrl = notification.sourceServerUrl
            ?.toString()
            .toLowerCase();
          const shouldNotify =
            (!connectedServerUrl &&
              !notificationServerUrl &&
              !notificationSourceServerUrl) ||
            (connectedServerUrl &&
              (notificationServerUrl === null ||
                connectedServerUrl === notificationServerUrl ||
                connectedServerUrl === notificationSourceServerUrl));
          if (!shouldNotify) {
            return;
          }
          if (notification.description) {
            const content = (
              <>
                <h4>{notification.message}</h4>
                {notification.description.wellName && (
                  <span>Well: {notification.description.wellName},</span>
                )}
                {notification.description.wellboreName && (
                  <span>
                    {" "}
                    Wellbore: {notification.description.wellboreName},
                  </span>
                )}
                {notification.description.objectName && (
                  <span> Name: {notification.description.objectName}</span>
                )}
                {notification.reason && (
                  <>
                    <br />
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      Reason: {notification.reason}
                    </span>
                  </>
                )}
              </>
            );
            setAlert({ severity: notification.severity, content });
          } else {
            const content = (
              <>
                <h4>{notification.message}</h4>
                {notification.reason && (
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    Reason: {notification.reason}
                  </span>
                )}
              </>
            );
            setAlert({ severity: notification.severity, content });
          }
        }
      );

    return function cleanup() {
      unsubscribeOnConnectionStateChanged();
      unsubscribeOnJobFinished();
    };
  }, [connectedServer]);

  return (
    <Collapse in={!!alert}>
      <AlertContainer colors={colors}>
        <Alert
          severity={alert?.severity ?? "error"}
          action={
            <Button
              variant="ghost_icon"
              aria-label="close"
              onClick={() => {
                setAlert(null);
              }}
            >
              <Icon name="clear" />
            </Button>
          }
        >
          <AlertTitle>
            {alert?.severity ? capitalize(alert.severity) : "Error"}
          </AlertTitle>
          {alert?.content}
        </Alert>
      </AlertContainer>
    </Collapse>
  );
};

const AlertContainer = styled.div<{ colors: Colors }>`
  & .MuiAlert-root {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
  & .MuiAlert-action {
    align-items: start;
  }
  & .MuiIconButton-root {
    margin-top: 8px;
  }
`;

export default Alerts;
