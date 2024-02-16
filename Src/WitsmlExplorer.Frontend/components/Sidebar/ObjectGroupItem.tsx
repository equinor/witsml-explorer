import { ComponentType, MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { FilterContext, VisibilityStatus } from "../../contexts/filter";
import OperationContext from "../../contexts/operationContext";
import { OperationAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { useGetObjectCount } from "../../hooks/query/useGetObjectCount";
import { useGetObjects } from "../../hooks/query/useGetObjects";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
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
import { EmptyTreeItem } from "./EmptyTreeItem";
import LogTypeItem from "./LogTypeItem";
import ObjectOnWellboreItem from "./ObjectOnWellboreItem";
import TreeItem from "./TreeItem";

interface ObjectGroupItemProps {
  wellUid: string;
  wellboreUid: string;
  objectType: ObjectType;
  ObjectContextMenu?: ComponentType<ObjectContextMenuProps>; //required only if objectsOnWellbore array is provided
  onGroupContextMenu?: (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => void;
}

export default function ObjectGroupItem({
  wellUid,
  wellboreUid,
  objectType,
  ObjectContextMenu,
  onGroupContextMenu
}: ObjectGroupItemProps) {
  const { dispatchOperation } = useContext(OperationContext);
  const { selectedFilter } = useContext(FilterContext);
  const navigate = useNavigate();
  const { expandedTreeNodes, dispatchSidebar } = useSidebar();
  const {
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectGroup
  } = useParams();
  const { authorizationState } = useAuthorizationState();
  const { objectCount, isFetching: isFetchingCount } = useGetObjectCount(
    authorizationState?.server,
    wellUid,
    wellboreUid,
    { enabled: isGroupObject(objectType) }
  );
  const { wellbore, isFetching: isFetchingWellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );
  const { objects: groupObjects, isFetching: isFetchingObjects } =
    useGetObjects(
      authorizationState?.server,
      wellUid,
      wellboreUid,
      objectType,
      {
        enabled: shouldFetchGroupObjects(
          expandedTreeNodes,
          wellbore,
          objectType
        )
      }
    );
  const isFetching =
    (isGroupObject(objectType) && isFetchingCount) ||
    isFetchingWellbore ||
    isFetchingObjects;
  let isActive = false;
  if (objectType === ObjectType.Log) {
    isActive =
      groupObjects && groupObjects.some((log: LogObject) => log.objectGrowing);
  }

  const onSelectObjectGroup = () => {
    navigate(
      `servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${objectType}/${
        objectType === ObjectType.Log ? "logtypes" : "objects"
      }`
    );
  };

  const toggleTreeNode = () => {
    dispatchSidebar({
      type: SidebarActionType.ToggleTreeNode,
      payload: { nodeId: calculateObjectGroupId(wellbore, objectType) }
    });
  };

  const onContextMenu = (event: MouseEvent<HTMLLIElement>) => {
    return onGroupContextMenu == null
      ? onGenericGroupContextMenu(
          event,
          objectType,
          wellbore,
          dispatchOperation
        )
      : onGroupContextMenu(event, wellbore);
  };
  const showStub =
    isGroupObject(objectType) &&
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
        isLoading={isFetching}
        onIconClick={toggleTreeNode}
        isActive={isActive}
        selected={
          calculateObjectGroupId(wellbore, objectType) ===
          calculateObjectGroupId(
            { wellUid: urlWellUid, uid: urlWellboreUid },
            objectGroup as ObjectType
          )
        }
      >
        {objectType === ObjectType.Log ? (
          <LogTypeItem
            logs={groupObjects}
            wellUid={wellUid}
            wellboreUid={wellboreUid}
          />
        ) : (
          (wellbore &&
            groupObjects &&
            groupObjects.map((objectOnWellbore: ObjectOnWellbore) => (
              <ObjectOnWellboreItem
                key={calculateObjectNodeId(objectOnWellbore, objectType)}
                nodeId={calculateObjectNodeId(objectOnWellbore, objectType)}
                objectOnWellbore={objectOnWellbore}
                objectType={objectType}
                ContextMenu={ObjectContextMenu}
                wellUid={wellUid}
                wellboreUid={wellboreUid}
              />
            ))) ||
          (showStub && <EmptyTreeItem />) // TODO: Should BhaRun, FormtaionMarker, Message and Risk show the toggle icon? It is showing for them now, but not originally.
        )}
      </TreeItem>
    )
  );
}

const onGenericGroupContextMenu = (
  event: MouseEvent<HTMLLIElement>,
  objectType: ObjectType,
  wellbore: Wellbore,
  dispatchOperation: (action: OperationAction) => void
) => {
  preventContextMenuPropagation(event);
  const contextMenuProps: ObjectsSidebarContextMenuProps = {
    wellbore,
    objectType
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

const shouldFetchGroupObjects = (
  expandedTreeNodes: string[],
  wellbore: Wellbore,
  objectType: ObjectType
) => {
  const isExpanded = expandedTreeNodes.includes(
    calculateObjectGroupId(wellbore, objectType)
  );
  return isExpanded && isGroupObject(objectType);
};

export const isGroupObject = (objectType: ObjectType) => {
  return (
    objectType !== ObjectType.BhaRun &&
    objectType !== ObjectType.FormationMarker &&
    objectType !== ObjectType.Message &&
    objectType !== ObjectType.Risk
  );
};
