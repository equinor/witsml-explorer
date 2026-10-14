import {
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
  calculateLogTypeAllId,
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
  getLogObjectsViewPath,
  getLogObjectViewPath
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
  const logTypeGroupAll = calculateLogTypeAllId(wellbore);

  const {
    logType: logTypeString,
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectUid
  } = useParams();

  const routerLogType = logTypeString as RouterLogType;

  const getNavPath = (logType: RouterLogType) => {
    return getLogObjectsViewPath(
      connectedServer?.url,
      wellUid,
      wellboreUid,
      ObjectType.Log,
      logType
    );
  };

  const getMultipleLogsNode = (logName: string, logType: RouterLogType) => {
    return calculateMultipleLogsNode(wellbore, logType, logName);
  };

  const getMultipleLogsNodeItem = (
    logName: string,
    logUid: string,
    logType: RouterLogType
  ) => {
    return calculateMultipleLogsNodeItem(wellbore, logType, logName, logUid);
  };

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore,
    logType: RouterLogType
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: LogsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      logType
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

  const filterLogsByType = (logs: LogObject[], indexType: string) => {
    return logs?.filter((log) => log.indexType === indexType) ?? [];
  };

  const depthLogs = filterLogsByType(logs, WITSML_INDEX_TYPE_MD);
  const timeLogs = filterLogsByType(logs, WITSML_INDEX_TYPE_DATE_TIME);

  const isSelected = (log: LogObject, logType: RouterLogType) => {
    return (
      calculateWellboreObjectNodeId(
        { wellUid: log.wellUid, uid: log.wellboreUid },
        logType,
        log.uid
      ) ===
      calculateWellboreObjectNodeId(
        { wellUid: urlWellUid, uid: urlWellboreUid },
        routerLogType,
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

  const listSubLogItems = (
    logObjects: LogObject[],
    logType: RouterLogType,
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
        <Fragment key={getMultipleLogsNodeItem(log.name, log.uid, logType)}>
          <LogItem
            logObjects={logObjects}
            log={log}
            logType={logType}
            nodeId={getMultipleLogsNodeItem(log.name, log.uid, logType)}
            selected={isSelected(log, logType)}
            objectGrowing={log.objectGrowing}
            to={getLogObjectViewPath(
              serverUrl,
              wellUid,
              wellboreUid,
              ObjectType.Log,
              logType,
              log.uid
            )}
          />
        </Fragment>
      ));
  };

  const listLogItemsByType = (
    logObjects: LogObject[],
    logType: RouterLogType,
    wellUid: string,
    wellboreUid: string,
    isSelected: (log: LogObject, logType: RouterLogType) => boolean,
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
          key={getMultipleLogsNode(log.name, logType)}
          nodeId={getMultipleLogsNode(log.name, logType)}
          isActive={logObjects
            .filter((x) => x.name === log.name)
            ?.some((log) => log.objectGrowing)}
          to={`${getNavPath(logType)}?${createColumnFilterSearchParams(
            searchParams,
            {
              name: log.name
            }
          )}`}
          selected={
            calculateMultipleLogsNode(
              { wellUid: urlWellUid, uid: urlWellboreUid },
              routerLogType,
              log.name
            ) ===
            calculateMultipleLogsNode(
              wellbore,
              logType,
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
            logType={logType}
            nodeId={calculateObjectNodeId(log, ObjectType.Log)}
            selected={isSelected(log, logType)}
            objectGrowing={log.objectGrowing}
            to={getLogObjectViewPath(
              serverUrl,
              wellUid,
              wellboreUid,
              ObjectType.Log,
              logType,
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
        labelText={"All"}
        nodeId={logTypeGroupAll}
        to={getNavPath(RouterLogType.ALL)}
        onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
          onContextMenu(event, wellbore, RouterLogType.ALL)
        }
        isActive={false}
        selected={
          calculateLogTypeId(
            { wellUid: urlWellUid, uid: urlWellboreUid },
            routerLogType
          ) === calculateLogTypeId(wellbore, RouterLogType.ALL)
        }
      >
        {listLogItemsByType(
          logs ?? [],
          RouterLogType.ALL,
          wellUid,
          wellboreUid,
          isSelected,
          connectedServer?.url
        )}
      </TreeItem>
      <TreeItem
        labelText={"Depth"}
        nodeId={logTypeGroupDepth}
        to={getNavPath(RouterLogType.DEPTH)}
        onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
          onContextMenu(event, wellbore, RouterLogType.DEPTH)
        }
        isActive={depthLogs?.some((log) => log.objectGrowing)}
        selected={
          calculateLogTypeId(
            { wellUid: urlWellUid, uid: urlWellboreUid },
            routerLogType
          ) === calculateLogTypeId(wellbore, RouterLogType.DEPTH)
        }
      >
        {listLogItemsByType(
          depthLogs,
          RouterLogType.DEPTH,
          wellUid,
          wellboreUid,
          isSelected,
          connectedServer?.url
        )}
      </TreeItem>
      <TreeItem
        nodeId={logTypeGroupTime}
        labelText={"Time"}
        to={getNavPath(RouterLogType.TIME)}
        onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
          onContextMenu(event, wellbore, RouterLogType.TIME)
        }
        isActive={timeLogs?.some((log) => log.objectGrowing)}
        selected={
          calculateLogTypeId(
            { wellUid: urlWellUid, uid: urlWellboreUid },
            routerLogType
          ) === calculateLogTypeId(wellbore, RouterLogType.TIME)
        }
      >
        {listLogItemsByType(
          timeLogs,
          RouterLogType.TIME,
          wellUid,
          wellboreUid,
          isSelected,
          connectedServer?.url
        )}
      </TreeItem>
    </>
  );
}
