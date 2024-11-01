import {
  WITSML_INDEX_TYPE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import { createColumnFilterSearchParams } from "components/ContentViews/table/ColumnOptionsMenu";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import LogsContextMenu, {
  LogsContextMenuProps
} from "components/ContextMenus/LogsContextMenu";
import LogItem from "components/Sidebar/LogItem";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import { calculateObjectNodeId } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Wellbore, {
  calculateLogTypeDepthId,
  calculateLogTypeId,
  calculateLogTypeTimeId,
  calculateMultipleLogsNode,
  calculateMultipleLogsNodeItem,
  calculateObjectNodeId as calculateWellboreObjectNodeId
} from "models/wellbore";
import { Fragment, MouseEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  const { dispatchOperation } = useOperationState();
  const [searchParams] = useSearchParams();
  const { servers } = useGetServers();
  const { connectedServer } = useConnectedServer();
  const { wellbore } = useGetWellbore(connectedServer, wellUid, wellboreUid);
  const logTypeGroupDepth = calculateLogTypeDepthId(wellbore);
  const logTypeGroupTime = calculateLogTypeTimeId(wellbore);

  const {
    logType,
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectUid
  } = useParams();

  const getNavPath = (logTypeGroup: string) => {
    const logTypePath =
      logTypeGroup === logTypeGroupDepth
        ? RouterLogType.DEPTH
        : RouterLogType.TIME;
    return getLogObjectsViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      ObjectType.Log,
      logTypePath
    );
  };

  const getMultipleLogsNode = (logName: string) => {
    return calculateMultipleLogsNode(wellbore, logName);
  };

  const getMultipleLogsNodeItem = (logName: string, logUid: string) => {
    return calculateMultipleLogsNodeItem(wellbore, logName, logUid);
  };

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore,
    indexType: WITSML_INDEX_TYPE
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: LogsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      indexType
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

  const filterLogsByType = (logs: LogObject[], logType: string) => {
    return logs?.filter((log) => log.indexType === logType) ?? [];
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

  const subLogsCount = (logs: LogObject[], logName: string) => {
    return logs.filter((x) => x.name === logName).length;
  };

  const subLogsNodeName = (logName: string) => {
    return logName + " (multiple)";
  };

  const getLogTypePath = (logType: string) => {
    return logType === WITSML_INDEX_TYPE_DATE_TIME
      ? RouterLogType.TIME
      : RouterLogType.DEPTH;
  };

  const getLogTypeGroup = (logType: string) => {
    return logType === WITSML_INDEX_TYPE_DATE_TIME
      ? logTypeGroupTime
      : logTypeGroupDepth;
  };

  const listSubLogItems = (
    logObjects: LogObject[],
    logType: string,
    wellUid: string,
    wellboreUid: string,
    serverUrl: string
  ) => {
    return logObjects
      ?.sort(
        (a, b) =>
          a.runNumber?.localeCompare(b.runNumber) || a.uid.localeCompare(b.uid)
      )
      .map((log) => (
        <Fragment key={getMultipleLogsNodeItem(log.name, log.uid)}>
          <LogItem
            logObjects={logObjects}
            log={log}
            nodeId={getMultipleLogsNodeItem(log.name, log.uid)}
            selected={isSelected(log)}
            objectGrowing={log.objectGrowing}
            to={getLogObjectViewPath(
              serverUrl,
              wellUid,
              wellboreUid,
              ObjectType.Log,
              getLogTypePath(logType),
              log.uid
            )}
          />
        </Fragment>
      ));
  };

  const listLogItemsByType = (
    logObjects: LogObject[],
    logType: string,
    wellUid: string,
    wellboreUid: string,
    isSelected: (log: LogObject) => boolean,
    serverUrl: string
  ) => {
    const distinctLogObjects = logObjects.filter(
      (logObject, i, arr) =>
        arr.findIndex((t) => t.name === logObject.name) === i
    );
    return distinctLogObjects?.map((log) =>
      subLogsCount(logObjects, log.name) > 1 ? (
        <TreeItem
          labelText={subLogsNodeName(log.name)}
          key={getMultipleLogsNode(log.name)}
          nodeId={getMultipleLogsNode(log.name)}
          isActive={logObjects
            .filter((x) => x.name === log.name)
            ?.some((log) => log.objectGrowing)}
          to={`${getNavPath(
            getLogTypeGroup(logType)
          )}?${createColumnFilterSearchParams(searchParams, {
            name: log.name
          })}`}
          selected={
            calculateMultipleLogsNode(
              { wellUid: urlWellUid, uid: urlWellboreUid },
              log.name
            ) ===
            calculateMultipleLogsNode(
              wellbore,
              logObjects.find((x) => x.uid === objectUid)?.name
            )
          }
        >
          {listSubLogItems(
            logObjects.filter((x) => x.name === log.name),
            logType,
            wellUid,
            wellboreUid,
            connectedServer?.url
          )}
        </TreeItem>
      ) : (
        <Fragment key={calculateObjectNodeId(log, ObjectType.Log)}>
          <LogItem
            logObjects={logObjects}
            log={log}
            nodeId={calculateObjectNodeId(log, ObjectType.Log)}
            selected={isSelected(log)}
            objectGrowing={log.objectGrowing}
            to={getLogObjectViewPath(
              serverUrl,
              wellUid,
              wellboreUid,
              ObjectType.Log,
              getLogTypePath(logType),
              log.uid
            )}
          />
        </Fragment>
      )
    );
  };

  return (
    <>
      <TreeItem
        labelText={"Depth"}
        nodeId={logTypeGroupDepth}
        to={getNavPath(logTypeGroupDepth)}
        onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
          onContextMenu(event, wellbore, WITSML_INDEX_TYPE_MD)
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
          isSelected,
          connectedServer?.url
        )}
      </TreeItem>
      <TreeItem
        nodeId={logTypeGroupTime}
        labelText={"Time"}
        to={getNavPath(logTypeGroupTime)}
        onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
          onContextMenu(event, wellbore, WITSML_INDEX_TYPE_DATE_TIME)
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
          isSelected,
          connectedServer?.url
        )}
      </TreeItem>
    </>
  );
}
