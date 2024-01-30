import {
  ComponentType,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
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
import Wellbore, {
  calculateObjectGroupId,
  getObjectsFromWellbore
} from "../../models/wellbore";
import ObjectService from "../../services/objectService";
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
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const [groupObjects, setGroupObjects] = useState<any>(null);
  let isActive = false;
  if (objectType === ObjectType.Log) {
    isActive =
      groupObjects && groupObjects.some((log: LogObject) => log.objectGrowing);
  }
  const { wellUid, wellboreUid, objectGroup } = useParams();

  const findExpandedNode = (): any => {
    return expandedTreeNodes.includes(
      calculateObjectGroupId(wellbore, objectType)
    );
  };

  const fetchObjects = async () => {
    const objects = getObjectsFromWellbore(wellbore, objectType);
    if (objects == null || objects.length == 0) {
      setIsLoading(true);
      const fetchedObjects = await ObjectService.getObjects(
        wellbore.wellUid,
        wellbore.uid,
        objectType
      );
      setGroupObjects(fetchedObjects);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // TODO: Fix fetching when refreshing
    if (
      findExpandedNode() &&
      !groupObjects &&
      objectType !== ObjectType.BhaRun &&
      objectType !== ObjectType.FormationMarker &&
      objectType !== ObjectType.Message &&
      objectType !== ObjectType.Risk
    ) {
      fetchObjects();
    }
  }, [wellUid, wellboreUid, objectGroup, expandedTreeNodes]);

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
        {objectType === ObjectType.Log ? (
          <LogTypeItem logs={groupObjects} />
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
