import React, { useContext } from "react";
import TreeItem from "./TreeItem";
import LogItem from "./LogItem";
import Well from "../../models/well";
import Wellbore, { calculateLogGroupId, calculateLogTypeDepthId, calculateLogTypeId, calculateLogTypeTimeId } from "../../models/wellbore";
import { WITSML_INDEX_TYPE_DATE_TIME, WITSML_INDEX_TYPE_MD } from "../Constants";
import LogObject, { calculateLogObjectNodeId } from "../../models/logObject";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { SelectLogTypeAction } from "../../contexts/navigationStateReducer";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import LogsContextMenu, { LogsContextMenuProps } from "../ContextMenus/LogsContextMenu";
import OperationType from "../../contexts/operationType";
import OperationContext from "../../contexts/operationContext";
import { IndexCurve } from "../Modals/LogPropertiesModal";

interface LogTypeItemProps {
  well: Well;
  wellbore: Wellbore;
}

const LogTypeItem = (props: LogTypeItemProps): React.ReactElement => {
  const { well, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedLog, servers } = navigationState;
  const logGroup = calculateLogGroupId(wellbore);
  const logTypeGroupDepth = calculateLogTypeDepthId(wellbore);
  const logTypeGroupTime = calculateLogTypeTimeId(wellbore);

  const onSelectType = async (logTypeGroup: string) => {
    const action: SelectLogTypeAction = { type: NavigationType.SelectLogType, payload: { well, wellbore, logGroup: logGroup, logTypeGroup: logTypeGroup } };
    dispatchNavigation(action);
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore, indexCurve: IndexCurve) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: LogsContextMenuProps = { dispatchOperation, wellbore, servers, indexCurve };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogsContextMenu {...contextMenuProps} />, position } });
  };
  const depthLogs = filterLogsByType(wellbore, WITSML_INDEX_TYPE_MD);
  const timeLogs = filterLogsByType(wellbore, WITSML_INDEX_TYPE_DATE_TIME);

  return (
    <>
      <TreeItem
        labelText={"Depth"}
        nodeId={logTypeGroupDepth}
        onLabelClick={() => onSelectType(logTypeGroupDepth)}
        onContextMenu={(event) => onContextMenu(event, wellbore, IndexCurve.Depth)}
        isActive={depthLogs.some((log) => log.objectGrowing)}
      >
        {listLogItemsByType(depthLogs, WITSML_INDEX_TYPE_MD, well, wellbore, logGroup, selectedLog)}
      </TreeItem>
      <TreeItem
        nodeId={logTypeGroupTime}
        labelText={"Time"}
        onLabelClick={() => onSelectType(logTypeGroupTime)}
        onContextMenu={(event) => onContextMenu(event, wellbore, IndexCurve.Time)}
        isActive={timeLogs.some((log) => log.objectGrowing)}
      >
        {listLogItemsByType(timeLogs, WITSML_INDEX_TYPE_DATE_TIME, well, wellbore, logGroup, selectedLog)}
      </TreeItem>
    </>
  );
};

const filterLogsByType = (wellbore: Wellbore, logType: string) => {
  return wellbore && wellbore.logs && wellbore.logs.filter((log) => log.indexType === logType);
};

const listLogItemsByType = (logObjects: LogObject[], logType: string, well: Well, wellbore: Wellbore, logGroup: string, selectedLog: LogObject) => {
  return logObjects.map((log) => (
    <LogItem
      key={calculateLogObjectNodeId(log)}
      log={log}
      well={well}
      wellbore={wellbore}
      logGroup={logGroup}
      logTypeGroup={calculateLogTypeId(wellbore, logType)}
      nodeId={calculateLogObjectNodeId(log)}
      selected={selectedLog?.uid === log.uid ? true : undefined}
      objectGrowing={log.objectGrowing}
    />
  ));
};

export default LogTypeItem;
