import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import LogObjectContextMenu from "components/ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TreeItem from "components/Sidebar/TreeItem";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import { MouseEvent } from "react";
import { getNameOccurrenceSuffix } from "tools/logSameNamesHelper";

interface LogItemProps {
  logObjects: LogObject[];
  log: LogObject;
  selected: boolean;
  nodeId: string;
  objectGrowing: boolean;
  to: string;
}

export default function LogItem({
  logObjects,
  log,
  selected,
  nodeId,
  objectGrowing,
  to
}: LogItemProps) {
  const { dispatchOperation } = useOperationState();

  const onContextMenu = (event: MouseEvent<HTMLLIElement>, log: LogObject) => {
    preventContextMenuPropagation(event);
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: [log]
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    <TreeItem
      onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
        onContextMenu(event, log)
      }
      key={nodeId}
      nodeId={nodeId}
      labelText={log.name + getNameOccurrenceSuffix(logObjects, log)}
      selected={selected}
      isActive={objectGrowing}
      to={to}
    />
  );
}
