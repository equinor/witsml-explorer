import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import LogObjectContextMenu, { LogObjectContextMenuProps } from "../ContextMenus/LogObjectContextMenu";
import TreeItem from "./TreeItem";

interface LogItemProps {
  log: LogObject;
  well: Well;
  wellbore: Wellbore;
  logGroup: string;
  logTypeGroup: string;
  selected: boolean;
  nodeId: string;
  objectGrowing: boolean;
}

const LogItem = (props: LogItemProps): React.ReactElement => {
  const { log: log, well, wellbore, selected, nodeId, objectGrowing } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const {
    dispatchNavigation,
    navigationState: { selectedServer, servers }
  } = useContext(NavigationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, log: LogObject) => {
    preventContextMenuPropagation(event);
    const contextProps: LogObjectContextMenuProps = { checkedLogObjects: [log], dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogObjectContextMenu {...contextProps} />, position } });
  };

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, log)}
      key={nodeId}
      nodeId={nodeId}
      labelText={log.runNumber ? `${log.name} (${log.runNumber})` : log.name}
      selected={selected}
      isActive={objectGrowing}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectLogObject, payload: { log, well, wellbore } })}
    />
  );
};
export default LogItem;
