import { useIsAuthenticated } from "@azure/msal-react";
import { useLoggedInUsernames } from "contexts/loggedInUsernamesContext";
import { LoggedInUsernamesActionType } from "contexts/loggedInUsernamesReducer";
import { useOperationState } from "hooks/useOperationState";
import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "../components/Modals/UserCredentialsModal";
import { useConnectedServer } from "../contexts/connectedServerContext";
import OperationType from "../contexts/operationType";
import { useGetServers } from "../hooks/query/useGetServers";
import { Server } from "../models/server";
import { msalEnabled } from "../msal/MsalAuthProvider";
import AuthorizationService, {
  AuthorizationState,
  AuthorizationStatus
} from "../services/authorizationService";

export default function AuthRoute() {
  const { dispatchOperation } = useOperationState();
  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  const { servers } = useGetServers({ enabled: isAuthenticated });
  const { serverUrl } = useParams();
  const { connectedServer, setConnectedServer } = useConnectedServer();
  const navigate = useNavigate();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();

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
            AuthorizationService.onServerStateChange(server);
            showCredentialsModal(server, false);
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

  useEffect(() => {
    if (
      servers &&
      (!connectedServer ||
        connectedServer.url.toLowerCase() != serverUrl.toLowerCase())
    ) {
      setConnectedServer(null);
      const server = servers.find(
        (server) => server.url.toLowerCase() === serverUrl.toLowerCase()
      );
      if (server) showCredentialsModal(server, true);
    }
  }, [servers, serverUrl]);

  const showCredentialsModal = (server: Server, initialLogin: boolean) => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: server,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(server, username);
        dispatchLoggedInUsernames({
          type: LoggedInUsernamesActionType.AddLoggedInUsername,
          payload: { serverId: server.id, username }
        });
        if (initialLogin) {
          AuthorizationService.setSelectedServer(server);
          setConnectedServer(server);
        }
      },
      onCancel: () => {
        if (initialLogin) navigate("/");
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  if (
    servers &&
    !servers.find(
      (server) => server.url.toLowerCase() === serverUrl.toLowerCase()
    )
  ) {
    return <ItemNotFound itemType="Server" />;
  }

  if (connectedServer) {
    return <Outlet />;
  }
  return null;
}
