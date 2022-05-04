import React, { useEffect, useState, useContext } from "react";
import { Card, Typography } from "@equinor/eds-core-react";
import NotificationService from "../services/notificationService";
//import Icon from "../styles/Icons"
//import { colors } from "../styles/Colors";
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
            {notification.description.wellName && <span>Well: {notification.description.wellName}</span>}
            {notification.description.wellboreName && <span>Wellbore: {notification.description.wellboreName}</span>}
            {notification.description.objectName && <span>Name: {notification.description.objectName}</span>}
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
    <>
      {alert && (
        <Card variant="danger">
          <Card.Header>
            <Typography variant="h5">{alert}</Typography>
          </Card.Header>
        </Card>
      )}
    </>
  );
};

export default Alerts;
