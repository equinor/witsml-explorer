import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import WbGeometry from "../../models/wbGeometry";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import WbGeometryObjectContextMenu, { WbGeometryObjectContextMenuProps } from "../ContextMenus/WbGeometryContextMenu";
import TreeItem from "./TreeItem";

interface WbGeometryProps {
  nodeId: string;
  wbGeometry: WbGeometry;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
}

const WbGeometryItem = (props: WbGeometryProps): React.ReactElement => {
  const { wbGeometry, selected, well, wellbore, nodeId } = props;
  const {
    dispatchNavigation,
    navigationState: { selectedServer, servers }
  } = useContext(NavigationContext);

  const { dispatchOperation } = useContext(OperationContext);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wbGeometry: WbGeometry) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WbGeometryObjectContextMenuProps = { checkedWbGeometryObjects: [wbGeometry], selectedServer, dispatchOperation, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WbGeometryObjectContextMenu {...contextMenuProps} />, position } });
  };

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={wbGeometry.name}
      selected={selected}
      onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectObject, payload: { object: wbGeometry, wellbore, well, objectType: ObjectType.WbGeometry } })}
      onContextMenu={(event: React.MouseEvent<HTMLLIElement>) => onContextMenu(event, wbGeometry)}
    />
  );
};

export default WbGeometryItem;
