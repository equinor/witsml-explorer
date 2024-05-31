import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { useGetWellbores } from "hooks/query/useGetWellbores";
import { ObjectType } from "models/objectType";
import { ReactElement, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import { getLogObjectsViewPath } from "routes/utils/pathBuilder";

export function HotKeyHandler(): ReactElement {
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const { wellbores } = useGetWellbores(connectedServer, wellUid);
  const { operationState } = useContext(OperationContext);
  const { modals, hotKeysEnabled } = operationState;

  const navigateToLogs = (routerLogType: RouterLogType) => {
    if (!connectedServer || !wellUid || modals?.length > 0) return;
    let wbUid = wellboreUid;
    if (!wbUid) {
      if (wellbores?.length !== 1) return;
      wbUid = wellbores[0].uid;
    }
    navigate(
      getLogObjectsViewPath(
        connectedServer?.url,
        wellUid,
        wbUid,
        ObjectType.Log,
        routerLogType
      )
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey) {
      switch (e.code) {
        case "KeyD":
          e.preventDefault();
          navigateToLogs(RouterLogType.DEPTH);
          break;
        case "KeyT":
          e.preventDefault();
          navigateToLogs(RouterLogType.TIME);
          break;
      }
    }
  };

  useEffect(() => {
    if (hotKeysEnabled) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, hotKeysEnabled]);

  return null;
}
