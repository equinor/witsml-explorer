import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import LogsContextMenu, {
  LogsContextMenuProps
} from "components/ContextMenus/LogsContextMenu";
import { IndexCurve } from "components/Modals/LogPropertiesModal";
import LogItem from "components/Sidebar/LogItem";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import LogObject from "models/logObject";
import { calculateObjectNodeId } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Wellbore, {
  calculateLogTypeDepthId,
  calculateLogTypeId,
  calculateLogTypeTimeId,
  calculateObjectGroupId,
  calculateObjectNodeId as calculateWellboreObjectNodeId
} from "models/wellbore";
import { Fragment, MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import {
  getLogObjectViewPath,
  getLogObjectsViewPath
} from "routes/utils/pathBuilder";

interface LogTypeItemProps {
  logs: LogObject[];
  wellUid: string;
  wellboreUid: string;
}

export default function LogTypeItem({
  logs,
  wellUid,
  wellboreUid
}: LogTypeItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const { servers } = useGetServers();
  const { connectedServer } = useConnectedServer();
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const logGroup = calculateObjectGroupId(wellbore, ObjectType.Log);
  const logTypeGroupDepth = calculateLogTypeDepthId(wellbore);
  const logTypeGroupTime = calculateLogTypeTimeId(wellbore);
  const navigate = useNavigate();
  const {
    logType,
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectUid
  } = useParams();

  const onSelectType = (logTypeGroup: string) => {
    const logTypePath =
      logTypeGroup === logTypeGroupDepth
        ? RouterLogType.DEPTH
        : RouterLogType.TIME;
    navigate(
      getLogObjectsViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.Log,
        logTypePath
      )
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

  const isSelected = (log: LogObject) => {
    return (
      calculateWellboreObjectNodeId(
        { wellUid: log.wellUid, uid: log.wellboreUid },
        log.indexType,
        log.uid
      ) ===
      calculateWellboreObjectNodeId(
        { wellUid: urlWellUid, uid: urlWellboreUid },
        logType === RouterLogType.DEPTH
          ? WITSML_INDEX_TYPE_MD
          : WITSML_INDEX_TYPE_DATE_TIME,
        objectUid
      )
    );
  };

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
        selected={
          calculateLogTypeId(
            { wellUid: urlWellUid, uid: urlWellboreUid },
            logType
          ) === calculateLogTypeId(wellbore, RouterLogType.DEPTH)
        }
      >
        {listLogItemsByType(
          depthLogs,
          WITSML_INDEX_TYPE_MD,
          wellUid,
          wellboreUid,
          logGroup,
          isSelected,
          connectedServer?.url
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
        selected={
          calculateLogTypeId(
            { wellUid: urlWellUid, uid: urlWellboreUid },
            logType
          ) === calculateLogTypeId(wellbore, RouterLogType.TIME)
        }
      >
        {listLogItemsByType(
          timeLogs,
          WITSML_INDEX_TYPE_DATE_TIME,
          wellUid,
          wellboreUid,
          logGroup,
          isSelected,
          connectedServer?.url
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
  wellUid: string,
  wellboreUid: string,
  logGroup: string,
  isSelected: (log: LogObject) => boolean,
  serverUrl: string
) => {
  const logTypePath =
    logType === WITSML_INDEX_TYPE_DATE_TIME
      ? RouterLogType.TIME
      : RouterLogType.DEPTH;
  return logObjects?.map((log) => (
    <Fragment key={calculateObjectNodeId(log, ObjectType.Log)}>
      <LogItem
        log={log}
        wellUid={wellUid}
        wellboreUid={wellboreUid}
        logGroup={logGroup}
        logTypeGroup={calculateLogTypeId(
          { wellUid, uid: wellboreUid },
          logType
        )}
        nodeId={calculateObjectNodeId(log, ObjectType.Log)}
        selected={isSelected(log)}
        objectGrowing={log.objectGrowing}
        to={getLogObjectViewPath(
          serverUrl,
          wellUid,
          wellboreUid,
          ObjectType.Log,
          logTypePath,
          log.uid
        )}
      />
    </Fragment>
  ));
};
