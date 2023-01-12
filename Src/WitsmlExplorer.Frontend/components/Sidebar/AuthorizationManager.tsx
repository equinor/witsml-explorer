import React, { useContext, useEffect } from "react";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService, { AuthorizationState, AuthorizationStatus } from "../../services/credentialsService";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";

const AuthorizationManager = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);

  useEffect(() => {
    const unsubscribe = CredentialsService.onAuthorizationChangeEvent.subscribe(async (authorizationState: AuthorizationState) => {
      if (authorizationState.status == AuthorizationStatus.Unauthorized && !CredentialsService.serverIsAwaitingAuthorization(authorizationState.server)) {
        showCredentialsModal(authorizationState.server);
        CredentialsService.awaitServerAuthorization(authorizationState.server);
      } else if (authorizationState.status == AuthorizationStatus.Authorized || authorizationState.status == AuthorizationStatus.Cancel) {
        CredentialsService.finishServerAuthorization(authorizationState.server);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
