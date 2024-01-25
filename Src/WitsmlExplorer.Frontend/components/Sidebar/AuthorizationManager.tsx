import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import ModificationType from "contexts/modificationType";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { Server } from "models/server";
import React, { useContext, useEffect } from "react";
import AuthorizationService, {
  AuthorizationState,
  AuthorizationStatus
} from "services/authorizationService";

const AuthorizationManager = (): React.ReactElement => {
  const { dispatchOperation } = useContext(OperationContext);
  const { dispatchNavigation } = useContext(NavigationContext);

  useEffect(() => {
    const unsubscribe =
      AuthorizationService.onAuthorizationChangeEvent.subscribe(
        async (authorizationState: AuthorizationState) => {
          const server = authorizationState.server;
          if (
            authorizationState.status == AuthorizationStatus.Unauthorized &&
            !AuthorizationService.serverIsAwaitingAuthorization(server)
          ) {
            const index = server.usernames.findIndex(
              (u) => u == server.currentUsername
            );
            if (index !== -1) {
              server.usernames.splice(index, 1);
            }
            dispatchNavigation({
              type: ModificationType.UpdateServer,
              payload: { server }
            });
            showCredentialsModal(server);
            AuthorizationService.awaitServerAuthorization(server);
          } else if (
            authorizationState.status == AuthorizationStatus.Authorized ||
            authorizationState.status == AuthorizationStatus.Cancel
          ) {
            AuthorizationService.finishServerAuthorization(server);
          }
        }
      );
    return () => {
      unsubscribe();
    };
  }, []);

  const showCredentialsModal = (server: Server) => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: server,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(server, username, dispatchNavigation);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  return <></>;
};

export default AuthorizationManager;
