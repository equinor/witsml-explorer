import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { Collapse, IconButton } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import NotificationService from "../services/notificationService";
import { Close } from "@material-ui/icons";
import { colors } from "../styles/Colors";
import NavigationContext from "../contexts/navigationContext";

const Alerts = (): React.ReactElement => {
  const [alert, setAlert] = useState<string | React.ReactNode>();
  const { navigationState } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribeOnConnectionStateChanged = NotificationService.Instance.onConnectionStateChanged.subscribe((connected) => {
      if (connected) {
        setAlert(null);
      } else {
        setAlert("Lost connection to notifications service. Please wait for reconnection or refresh browser");
      }
    });
    const unsubscribeOnJobFinished = NotificationService.Instance.alertDispatcher.subscribe((notification) => {
      const shouldNotify = notification.serverUrl.toString() === navigationState.selectedServer?.url;
      if (!shouldNotify) {
        return;
      }

      if (notification.description) {
        const content = (
          <>
            <h4>{notification.message}</h4>
            {notification.description.wellName && <span>Well: {notification.description.wellName},</span>}
            {notification.description.wellboreName && <span> Wellbore: {notification.description.wellboreName},</span>}
            {notification.description.objectName && <span> Name: {notification.description.objectName}</span>}
            {notification.reason && (
              <>
                <br />
                <span>Reason: {notification.reason}</span>
              </>
            )}
          </>
        );
        setAlert(content);
      } else {
        const content = (
          <>
            <h4>{notification.message}</h4>
            {notification.reason && <span>Reason: {notification.reason}</span>}
          </>
        );
        setAlert(content);
      }
    });

    return function cleanup() {
      unsubscribeOnConnectionStateChanged();
      unsubscribeOnJobFinished();
    };
  }, [navigationState.selectedServer]);

  return (
    <Collapse in={!!alert}>
      <AlertContainer>
        <Alert
          severity={"error"}
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
          <AlertTitle>Error</AlertTitle>
          {alert}
        </Alert>
      </AlertContainer>
    </Collapse>
  );
};

const AlertContainer = styled.div`
  & .MuiAlert-root {
    background-color: ${colors.ui.backgroundDefault};
  }
  & .MuiAlert-action {
    align-items: start;
  }
  & .MuiIconButton-root {
    margin-top: 8px;
  }
`;

export default Alerts;
