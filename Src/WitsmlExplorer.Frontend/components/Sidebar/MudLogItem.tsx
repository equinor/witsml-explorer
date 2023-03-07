import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import MudLog from "../../models/mudLog";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import MudLogContextMenu, { MudLogContextMenuProps } from "../ContextMenus/MudLogContextMenu";
import TreeItem from "./TreeItem";

interface MudLogProps {
  nodeId: string;
  mudLog: MudLog;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const MudLogItem = (props: MudLogProps): React.ReactElement => {
  const { mudLog, selected, well, wellbore, nodeId } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: MudLogContextMenuProps = { mudLogs: [mudLog] };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <MudLogContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={mudLog.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectObject, payload: { object: mudLog, wellbore, well, objectType: ObjectType.MudLog } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event)}
    />
  );
};

export default MudLogItem;
