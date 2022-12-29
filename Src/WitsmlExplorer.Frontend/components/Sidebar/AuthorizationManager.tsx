import React, { useContext, useEffect, useState } from "react";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService, { AuthorizationState, AuthorizationStatus } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

const AuthorizationManager = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);
  const [currentAuthorization, setAuthorization] = useState<AuthorizationState>();

  useEffect(() => {
    const unsubscribe = CredentialsService.onAuthorizationChanged.subscribe(async (authorizationState) => {
      if (authorizationState.status == AuthorizationStatus.Unauthorized) {
        setAuthorization(authorizationState);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentAuthorization?.status == AuthorizationStatus.Unauthorized && currentAuthorization?.server) {
      showCredentialsModal(currentAuthorization.server);
    }
  }, [currentAuthorization]);

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
      onCancel: () => dispatchOperation({ type: OperationType.HideModal }),
      errorMessage
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
  };

  return <></>;
};

export default AuthorizationManager;
