import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import LogObjectContextMenu from "components/ContextMenus/LogObjectContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TreeItem from "components/Sidebar/TreeItem";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";

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
  const { dispatchNavigation } = useContext(NavigationContext);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    log: LogObject
  ) => {
    preventContextMenuPropagation(event);
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: [log],
      wellbore
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
      onContextMenu={(event) => onContextMenu(event, log)}
      key={nodeId}
      nodeId={nodeId}
      labelText={log.runNumber ? `${log.name} (${log.runNumber})` : log.name}
      selected={selected}
      isActive={objectGrowing}
      onLabelClick={() =>
        dispatchNavigation({
          type: NavigationType.SelectObject,
          payload: { object: log, well, wellbore, objectType: ObjectType.Log }
        })
      }
    />
  );
};
export default LogItem;
