import React, { useCallback, useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import GeologyInterval from "../../models/geologyInterval";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import GeologyIntervalContextMenu, { GeologyIntervalContextMenuProps } from "../ContextMenus/GeologyIntervalContextMenu";
import TreeItem from "./TreeItem";

interface GeologyIntervalProps {
  geology: GeologyInterval;
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  nodeId: string;
  mudloguid: string;
}

const GeologyIntervalItem = (props: GeologyIntervalProps): React.ReactElement => {
  const { geology: geology, well, wellbore, nodeId, mudloguid } = props;
  useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);

  geology["mudloguid"] = mudloguid;

  const { dispatchNavigation, navigationState } = useContext(NavigationContext);
  const { selectedObject, selectedObjectGroup } = navigationState;

  const isSelected = useCallback(
    (geology: GeologyInterval) => {
      return selectedObject && selectedObjectGroup === ObjectType.geologyInterval && selectedObject.uid === geology.uid ? true : undefined;
    },
    [selectedObject, selectedObjectGroup]
  );

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, GeologyInterval: GeologyInterval[]) => {
    preventContextMenuPropagation(event);
    const contextProps: GeologyIntervalContextMenuProps = { checkedGeologyIntervals: GeologyInterval };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <GeologyIntervalContextMenu {...contextProps} />, position } });
  };

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, [geology])}
      key={nodeId}
      nodeId={nodeId}
      labelText={geology.typeLithology}
      selected={isSelected(geology)}
      onLabelClick={() => {
        dispatchNavigation({ type: NavigationType.SelectObject, payload: { well: well, wellbore: wellbore, object: geology, objectType: ObjectType.geologyInterval } });
      }}
    />
  );
};
export default GeologyIntervalItem;
