import {
  ComponentType,
  MouseEvent,
  useCallback,
  useContext,
  useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import { ObjectGroupItemProvider } from "../../contexts/objectGroupItemContext";
import OperationContext from "../../contexts/operationContext";
import { OperationAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { useWellboreItem } from "../../contexts/wellboreItemContext";
import LogObject from "../../models/logObject";
import ObjectOnWellbore, {
  calculateObjectNodeId
} from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import Wellbore, { calculateObjectGroupId } from "../../models/wellbore";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import { pluralize } from "../ContextMenus/ContextMenuUtils";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import ObjectsSidebarContextMenu, {
  ObjectsSidebarContextMenuProps
} from "../ContextMenus/ObjectsSidebarContextMenu";
import LogTypeItem from "./LogTypeItem";
import ObjectOnWellboreItem from "./ObjectOnWellboreItem";
import TreeItem from "./TreeItem";

interface ObjectGroupItemProps {
  objectType: ObjectType;
  ObjectContextMenu?: ComponentType<ObjectContextMenuProps>; //required only if objectsOnWellbore array is provided
  onGroupContextMenu?: (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore,
    setIsLoading: (arg: boolean) => void
  ) => void;
  to?: string;
}

export default function ObjectGroupItem({
  objectType,
  ObjectContextMenu,
  onGroupContextMenu,
  to
}: ObjectGroupItemProps) {
  const {
    navigationState: { selectedObject, selectedObjectGroup }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { wellbore, well, objectCount } = useWellboreItem();
  const { selectedFilter } = useContext(FilterContext);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatchSidebar } = useSidebar();
  const [groupObjects, setGroupObjects] = useState<any>(null);
  let isActive = false;
  if (objectType === ObjectType.Log) {
    isActive =
      groupObjects && groupObjects.some((log: LogObject) => log.objectGrowing);
  }
  const { wellUid, wellboreUid, objectGroup } = useParams();

  const onSelectObjectGroup = useCallback(async () => {
    if (to) navigate(to);
  }, [well, wellbore, objectType]);

  const toggleTreeNode = useCallback(async () => {
    dispatchSidebar({
      type: SidebarActionType.ToggleTreeNode,
      payload: { nodeId: calculateObjectGroupId(wellbore, objectType) }
    });
  }, [well, wellbore, objectType]);

  const isSelected = useCallback(
    (objectType: ObjectType, objectOnWellbore: ObjectOnWellbore) => {
      return (
        selectedObject &&
        selectedObjectGroup === objectType &&
        selectedObject.uid === objectOnWellbore.uid &&
        selectedObject.wellboreUid === objectOnWellbore.wellboreUid &&
        selectedObject.wellUid === objectOnWellbore.wellUid
      );
    },
    [selectedObject, selectedObjectGroup]
  );

  const onContextMenu = (event: MouseEvent<HTMLLIElement>) => {
    return onGroupContextMenu == null
      ? onGenericGroupContextMenu(
          event,
          objectType,
          wellbore,
          dispatchOperation,
          setIsLoading
        )
      : onGroupContextMenu(event, wellbore, setIsLoading);
  };
  const showStub =
    objectCount != null &&
    objectCount[objectType] != null &&
    objectCount[objectType] != 0;

  return (
    selectedFilter.objectVisibilityStatus[objectType] ===
      VisibilityStatus.Visible && (
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, objectType)}
        labelText={pluralize(objectType)}
        onLabelClick={onSelectObjectGroup}
        onContextMenu={onContextMenu}
        isLoading={isLoading}
        onIconClick={toggleTreeNode}
        isActive={isActive}
        selected={
          calculateObjectGroupId(wellbore, objectType) ===
          calculateObjectGroupId(
            { wellUid, uid: wellboreUid },
            objectGroup as ObjectType
          )
        }
      >
        <ObjectGroupItemProvider
          wellbore={wellbore}
          objectType={objectType}
          setParentGroupObjects={setGroupObjects}
          setIsFetching={setIsLoading}
        >
          {objectType === ObjectType.Log ? (
            <LogTypeItem />
          ) : (
            (wellbore &&
              groupObjects &&
              groupObjects.map((objectOnWellbore: ObjectOnWellbore) => (
                <ObjectOnWellboreItem
                  key={calculateObjectNodeId(objectOnWellbore, objectType)}
                  nodeId={calculateObjectNodeId(objectOnWellbore, objectType)}
                  objectOnWellbore={objectOnWellbore}
                  objectType={objectType}
                  selected={isSelected(objectType, objectOnWellbore)}
                  ContextMenu={ObjectContextMenu}
                />
              ))) ||
            (showStub && ["", ""])
          )}
        </ObjectGroupItemProvider>
      </TreeItem>
    )
  );
}

const onGenericGroupContextMenu = (
  event: MouseEvent<HTMLLIElement>,
  objectType: ObjectType,
  wellbore: Wellbore,
  dispatchOperation: (action: OperationAction) => void,
  setIsLoading: (arg: boolean) => void
) => {
  preventContextMenuPropagation(event);
  const contextMenuProps: ObjectsSidebarContextMenuProps = {
    wellbore,
    objectType,
    setIsLoading
  };
  const position = getContextMenuPosition(event);
  dispatchOperation({
    type: OperationType.DisplayContextMenu,
    payload: {
      component: <ObjectsSidebarContextMenu {...contextMenuProps} />,
      position
    }
  });
};
