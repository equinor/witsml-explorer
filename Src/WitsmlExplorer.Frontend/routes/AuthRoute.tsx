import { useIsAuthenticated } from "@azure/msal-react";
import { useContext, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "../components/Modals/UserCredentialsModal";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import {
  FilterContext,
  VisibilityStatus,
  allVisibleObjects
} from "../contexts/filter";
import { UpdateServerListAction } from "../contexts/modificationActions";
import ModificationType from "../contexts/modificationType";
import { SelectServerAction } from "../contexts/navigationActions";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import OperationContext from "../contexts/operationContext";
import OperationType from "../contexts/operationType";
import { useServers } from "../contexts/serversContext";
import { ObjectType } from "../models/objectType";
import { Server } from "../models/server";
import { msalEnabled } from "../msal/MsalAuthProvider";
import AuthorizationService, {
  AuthorizationStatus
} from "../services/authorizationService";
import CapService from "../services/capService";
import NotificationService from "../services/notificationService";
import ServerService from "../services/serverService";
import WellService from "../services/wellService";
import {
  STORAGE_FILTER_HIDDENOBJECTS_KEY,
  getLocalStorageItem
} from "../tools/localStorageHelpers";

export default function AuthRoute() {
  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const { servers, wells, selectedServer } = navigationState;
  const [hasFetchedServers, setHasFetchedServers] = useState(false);
  const { updateSelectedFilter } = useContext(FilterContext);
  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  const { serverUrl } = useParams();
  const { dispatchOperation } = useContext(OperationContext);
  const { authorizationState, setAuthorizationState } = useAuthorizationState();
  const { setServers } = useServers();

  useEffect(() => {
    const unsubscribeFromCredentialsEvents =
      AuthorizationService.onAuthorizationChangeEvent.subscribe(
        async (authorizationState) => {
          setAuthorizationState(authorizationState);
        }
      );
    return () => {
      unsubscribeFromCredentialsEvents();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedServers) {
      const abortController = new AbortController();
      const getServers = async () => {
        const freshServers = await ServerService.getServers(
          abortController.signal
        );
        setHasFetchedServers(true);
        const action: UpdateServerListAction = {
          type: ModificationType.UpdateServerList,
          payload: { servers: freshServers }
        };
        dispatchNavigation(action);
        setServers(freshServers);
      };
      getServers();

      return () => {
        abortController.abort();
      };
    }
  }, [isAuthenticated, hasFetchedServers]);

  useEffect(() => {
    // update selected server when servers are fetched
    if (servers.length !== 0) {
      if (serverUrl == null) {
        return;
      }
      const server = servers.find(
        (server: Server) => server.url.toLowerCase() === serverUrl.toLowerCase()
      );
      if (server && !selectedServer) {
        const onSelectItem = async (server: Server) => {
          if (server.id === selectedServer?.id) {
            const action: SelectServerAction = {
              type: NavigationType.SelectServer,
              payload: { server: null }
            };
            dispatchNavigation(action);
          } else {
            const userCredentialsModalProps: UserCredentialsModalProps = {
              server,
              onConnectionVerified: (username) => {
                dispatchOperation({ type: OperationType.HideModal });
                AuthorizationService.onAuthorized(
                  server,
                  username,
                  dispatchNavigation
                );
                const action: SelectServerAction = {
                  type: NavigationType.SelectServer,
                  payload: { server }
                };
                dispatchNavigation(action);
              }
            };
            dispatchOperation({
              type: OperationType.DisplayModal,
              payload: <UserCredentialsModal {...userCredentialsModalProps} />
            });
          }
        };

        onSelectItem(server);
      }
    }
  }, [servers]);

  const updateVisibleObjects = (supportedObjects: string[]) => {
    const updatedVisibility = { ...allVisibleObjects };
    const hiddenItems = getLocalStorageItem<ObjectType[]>(
      STORAGE_FILTER_HIDDENOBJECTS_KEY,
      { defaultValue: [] }
    );
    hiddenItems.forEach(
      (objectType) => (updatedVisibility[objectType] = VisibilityStatus.Hidden)
    );
    Object.values(ObjectType)
      .filter(
        (objectType) =>
          !supportedObjects
            .map((o) => o.toLowerCase())
            .includes(objectType.toLowerCase())
      )
      .forEach(
        (objectType) =>
          (updatedVisibility[objectType] = VisibilityStatus.Disabled)
      );
    updateSelectedFilter({ objectVisibilityStatus: updatedVisibility });
  };

  useEffect(() => {
    const abortController = new AbortController();
    const onCurrentLoginStateChange = async () => {
      if (
        selectedServer == null ||
        wells.length !== 0 ||
        (authorizationState &&
          authorizationState.status != AuthorizationStatus.Authorized)
      ) {
        return;
      }
      try {
        const [wells, supportedObjects] = await Promise.all([
          WellService.getWells(),
          CapService.getCapObjects()
        ]);
        updateVisibleObjects(supportedObjects);
        dispatchNavigation({
          type: ModificationType.UpdateWells,
          payload: { wells: wells }
        });
      } catch (error) {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(selectedServer.url),
          message: error.message,
          isSuccess: false
        });
        dispatchNavigation({
          type: NavigationType.SelectServer,
          payload: { server: null }
        });
      }
    };
    onCurrentLoginStateChange();
    return () => {
      abortController.abort();
    };
  }, [msalEnabled, selectedServer, authorizationState]);

  if (
    authorizationState &&
    authorizationState.status === AuthorizationStatus.Authorized
  ) {
    return <Outlet />;
  }
  return null;
}
