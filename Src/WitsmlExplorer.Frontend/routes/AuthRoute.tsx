import { useIsAuthenticated } from "@azure/msal-react";
import { useContext, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "../components/Modals/UserCredentialsModal";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import OperationContext from "../contexts/operationContext";
import OperationType from "../contexts/operationType";
import { useGetServers } from "../hooks/query/useGetServers";
import { Server } from "../models/server";
import { msalEnabled } from "../msal/MsalAuthProvider";
import AuthorizationService, {
  AuthorizationState,
  AuthorizationStatus
} from "../services/authorizationService";

export default function AuthRoute() {
  const { dispatchOperation } = useContext(OperationContext);
  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  const { servers } = useGetServers({ enabled: isAuthenticated });
  const { authorizationState, setAuthorizationState } = useAuthorizationState();
  const { serverUrl } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe =
      AuthorizationService.onAuthorizationChangeEvent.subscribe(
        async (authorizationState: AuthorizationState) => {
          setAuthorizationState(authorizationState);
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
            showCredentialsModal(server);
            AuthorizationService.awaitServerAuthorization(server);
          } else if (
            authorizationState.status == AuthorizationStatus.Authorized ||
            authorizationState.status == AuthorizationStatus.Cancel
          ) {
            AuthorizationService.finishServerAuthorization(server);
            if (authorizationState.status == AuthorizationStatus.Cancel) {
              navigate("/");
            }
          }
        }
      );
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (servers && authorizationState === undefined) {
      const server = servers.find((server) => server.url === serverUrl);
      showCredentialsModal(server);
    }
  }, [servers]);

  const showCredentialsModal = (server: Server) => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: server,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(server, username);
        AuthorizationService.setSelectedServer(server);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  if (
    authorizationState &&
    authorizationState.status === AuthorizationStatus.Authorized
  ) {
    return <Outlet />;
  }
  return null;
}
