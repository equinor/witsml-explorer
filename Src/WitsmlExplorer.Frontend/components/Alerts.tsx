import { Close } from "@mui/icons-material";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { capitalize } from "lodash";
import React, { useContext, useEffect, useState } from "react";
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
  } = useContext(OperationContext);

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
          const shouldNotify =
            notification.serverUrl == null ||
            notification.serverUrl.toString().toLowerCase() ===
              connectedServer?.url?.toLowerCase();
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
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setAlert(null);
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
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
