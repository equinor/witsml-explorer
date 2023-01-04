import React, { useContext, useEffect, useState } from "react";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService, { AuthorizationState, AuthorizationStatus } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

const AuthorizationManager = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);
  const [unauthorizedQueue, setUnauthorizedQueue] = useState<AuthorizationState[]>([]);
  const [shownModalQueue, setShownModalQueue] = useState<Server[]>([]);

  useEffect(() => {
    const unsubscribe = CredentialsService.onAuthorizationChanged.subscribe(async (authorizationState) => {
      if (authorizationState.status == AuthorizationStatus.Unauthorized) {
        const inUnauthorizedQueue = unauthorizedQueue.find((state) => state.server.id == authorizationState.server.id) != undefined;
        const inShownModalQueue = shownModalQueue.find((server) => server.id == authorizationState.server.id) != undefined;
        if (!inUnauthorizedQueue && !inShownModalQueue) {
          setUnauthorizedQueue(unauthorizedQueue.concat(authorizationState));
        }
      } else {
        const existingIndex = shownModalQueue.findIndex((server) => server.id == authorizationState.server.id);
        if (existingIndex !== -1) {
          shownModalQueue.splice(existingIndex, 1);
          setShownModalQueue([...shownModalQueue]);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (unauthorizedQueue.length == 0) {
      return;
    }
    unauthorizedQueue.forEach((state) => {
      const inShownModalQueue = shownModalQueue.find((server) => server.id == state.server.id) != undefined;
      if (inShownModalQueue) {
        return;
      }
      showCredentialsModal(state.server);
      shownModalQueue.push(state.server);
    });
    setShownModalQueue([...shownModalQueue]);
    setUnauthorizedQueue([]);
  }, [unauthorizedQueue]);

  const showCredentialsModal = (server: Server, errorMessage = "") => {
    const currentCredentials = CredentialsService.getCredentialsForServer(server);
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: server,
      serverCredentials: currentCredentials,
      mode: CredentialsMode.TEST,
      confirmText: "Login",
      onConnectionVerified: (credentials) => {
        dispatchOperation({ type: OperationType.HideModal });
        CredentialsService.saveCredentials({ ...credentials, password: "" });
      },
      errorMessage
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  return <></>;
};

export default AuthorizationManager;
