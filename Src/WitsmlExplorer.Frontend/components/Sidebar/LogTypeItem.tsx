import { Fragment, MouseEvent, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { SelectLogTypeAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { calculateObjectNodeId } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, {
  calculateLogTypeDepthId,
  calculateLogTypeId,
  calculateLogTypeTimeId,
  calculateObjectGroupId
} from "../../models/wellbore";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../Constants";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import LogsContextMenu, {
  LogsContextMenuProps
} from "../ContextMenus/LogsContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import LogItem from "./LogItem";
import TreeItem from "./TreeItem";
import { WellboreItemContext } from "./WellboreItem";

interface LogTypeItemProps {
  logs: LogObject[];
}

export default function LogTypeItem({ logs }: LogTypeItemProps) {
  const { wellbore, well } = useContext(WellboreItemContext);
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedObject, selectedObjectGroup, servers } = navigationState;
  const logGroup = calculateObjectGroupId(wellbore, ObjectType.Log);
  const logTypeGroupDepth = calculateLogTypeDepthId(wellbore);
  const logTypeGroupTime = calculateLogTypeTimeId(wellbore);
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();

  const onSelectType = async (logTypeGroup: string) => {
    const action: SelectLogTypeAction = {
      type: NavigationType.SelectLogType,
      payload: { well, wellbore, logTypeGroup: logTypeGroup }
    };
    dispatchNavigation(action);
    navigate(
      `servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        well.uid
      }/wellbores/${wellbore.uid}/objectgroups/logs/logtypes/${
        logTypeGroup === logTypeGroupDepth ? "depth" : "time"
      }/objects`
    );
  };

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore,
    indexCurve: IndexCurve
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: LogsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      indexCurve
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogsContextMenu {...contextMenuProps} />,
        position
      }
    });
  };
  const depthLogs = filterLogsByType(logs, WITSML_INDEX_TYPE_MD);
  const timeLogs = filterLogsByType(logs, WITSML_INDEX_TYPE_DATE_TIME);

  const isSelected = useCallback(
    (log: LogObject) => {
      return selectedObject &&
        selectedObjectGroup === ObjectType.Log &&
        selectedObject.uid === log.uid &&
        selectedObject.wellboreUid === log.wellboreUid &&
        selectedObject.wellUid === log.wellUid
        ? true
        : undefined;
    },
    [selectedObject, selectedObjectGroup]
  );

  return (
    <>
      <TreeItem
        labelText={"Depth"}
        nodeId={logTypeGroupDepth}
        onLabelClick={() => onSelectType(logTypeGroupDepth)}
        onContextMenu={(event) =>
          onContextMenu(event, wellbore, IndexCurve.Depth)
        }
        isActive={depthLogs?.some((log) => log.objectGrowing)}
      >
        {listLogItemsByType(
          depthLogs,
          WITSML_INDEX_TYPE_MD,
          well,
          wellbore,
          logGroup,
          isSelected,
          authorizationState.server.url
        )}
      </TreeItem>
      <TreeItem
        nodeId={logTypeGroupTime}
        labelText={"Time"}
        onLabelClick={() => onSelectType(logTypeGroupTime)}
        onContextMenu={(event) =>
          onContextMenu(event, wellbore, IndexCurve.Time)
        }
        isActive={timeLogs?.some((log) => log.objectGrowing)}
      >
        {listLogItemsByType(
          timeLogs,
          WITSML_INDEX_TYPE_DATE_TIME,
          well,
          wellbore,
          logGroup,
          isSelected,
          authorizationState.server.url
        )}
      </TreeItem>
    </>
  );
}

const filterLogsByType = (logs: LogObject[], logType: string) => {
  return logs?.filter((log) => log.indexType === logType) ?? [];
};

const listLogItemsByType = (
  logObjects: LogObject[],
  logType: string,
  well: Well,
  wellbore: Wellbore,
  logGroup: string,
  isSelected: (log: LogObject) => boolean,
  serverUrl: string
) => {
  return logObjects?.map((log) => (
    <Fragment key={calculateObjectNodeId(log, ObjectType.Log)}>
      <LogItem
        log={log}
        well={well}
        wellbore={wellbore}
        logGroup={logGroup}
        logTypeGroup={calculateLogTypeId(wellbore, logType)}
        nodeId={calculateObjectNodeId(log, ObjectType.Log)}
        selected={isSelected(log)}
        objectGrowing={log.objectGrowing}
        to={`servers/${encodeURIComponent(serverUrl)}/wells/${
          well.uid
        }/wellbores/${wellbore.uid}/objectgroups/logs/logtypes/${
          logType === WITSML_INDEX_TYPE_DATE_TIME ? "time" : "depth"
        }/objects/${log.uid}`}
      />
    </Fragment>
  ));
};
