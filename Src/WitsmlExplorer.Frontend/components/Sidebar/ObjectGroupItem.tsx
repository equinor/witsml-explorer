import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import ObjectsSidebarContextMenu, {
  ObjectsSidebarContextMenuProps
} from "components/ContextMenus/ObjectsSidebarContextMenu";
import { EmptyTreeItem } from "components/Sidebar/EmptyTreeItem";
import LogTypeItem from "components/Sidebar/LogTypeItem";
import ObjectOnWellboreItem from "components/Sidebar/ObjectOnWellboreItem";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  Filter,
  FilterContext,
  ObjectFilterType,
  VisibilityStatus,
  isObjectFilterType,
  objectFilterTypeToObjects
} from "contexts/filter";
import { OperationAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useSidebar } from "contexts/sidebarContext";
import { useGetCapObjects } from "hooks/query/useGetCapObjects";
import { useGetObjectCount } from "hooks/query/useGetObjectCount";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useObjectFilter } from "hooks/useObjectFilter";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import ObjectOnWellbore, {
  calculateObjectNodeId
} from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Wellbore, { calculateObjectGroupId } from "models/wellbore";
import { ComponentType, MouseEvent, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  getLogTypesViewPath,
  getObjectsViewPath
} from "routes/utils/pathBuilder";

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
  const { dispatchOperation } = useOperationState();
  const { selectedFilter } = useContext(FilterContext);
  const { expandedTreeNodes } = useSidebar();
  const {
    wellUid: urlWellUid,
    wellboreUid: urlWellboreUid,
    objectGroup
  } = useParams();
  const { connectedServer } = useConnectedServer();
  const { capObjects } = useGetCapObjects(connectedServer, {
    placeholderData: Object.entries(ObjectType)
  });
  const { objectCount, isFetching: isFetchingCount } = useGetObjectCount(
    connectedServer,
    wellUid,
    wellboreUid,
    { enabled: isExpandableGroupObject(objectType) }
  );
  const { wellbore, isFetching: isFetchingWellbore } = useGetWellbore(
    connectedServer,
    wellUid,
    wellboreUid
  );
  const { objects: groupObjects, isFetching: isFetchingObjects } =
    useGetObjects(connectedServer, wellUid, wellboreUid, objectType, {
      enabled: shouldFetchGroupObjects(expandedTreeNodes, wellbore, objectType)
    });
  const filteredGroupObjects = useObjectFilter(groupObjects, objectType);
  const isFetching =
    (isExpandableGroupObject(objectType) && isFetchingCount) ||
    isFetchingWellbore ||
    isFetchingObjects;
  let isActive = false;
  if (objectType === ObjectType.Log) {
    isActive =
      groupObjects && groupObjects.some((log: LogObject) => log.objectGrowing);
  }

  const getNavPath = () => {
    return objectType === ObjectType.Log
      ? getLogTypesViewPath(
          connectedServer?.url,
          wellUid,
          wellboreUid,
          objectType
        )
      : getObjectsViewPath(
          connectedServer?.url,
          wellUid,
          wellboreUid,
          objectType
        );
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
    isExpandableGroupObject(objectType) &&
    objectCount != null &&
    objectCount[objectType] != null &&
    objectCount[objectType] != 0;

  return (
    selectedFilter.objectVisibilityStatus[objectType] ===
      VisibilityStatus.Visible &&
    capObjects.includes(objectType) &&
    !isExcludedBySearch(selectedFilter, objectType) && (
      <TreeItem
        nodeId={calculateObjectGroupId(wellbore, objectType)}
        labelText={pluralize(objectType)}
        to={getNavPath()}
        onContextMenu={onContextMenu}
        isLoading={isFetching}
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
            logs={filteredGroupObjects}
            wellUid={wellUid}
            wellboreUid={wellboreUid}
          />
        ) : (
          (wellbore &&
            filteredGroupObjects &&
            isExpandableGroupObject(objectType) &&
            filteredGroupObjects.map((objectOnWellbore: ObjectOnWellbore) => (
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
          (showStub && <EmptyTreeItem />)
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
  return isExpanded && isExpandableGroupObject(objectType);
};

export const isExpandableGroupObject = (objectType: ObjectType) => {
  const expandableGroupObject = [
    ObjectType.FluidsReport,
    ObjectType.MudLog,
    ObjectType.Trajectory,
    ObjectType.Tubular,
    ObjectType.WbGeometry,
    ObjectType.Log
  ];
  return !!expandableGroupObject.includes(objectType);
};

const isExcludedBySearch = (selectedFilter: Filter, objectType: ObjectType) => {
  return (
    isObjectFilterType(selectedFilter.filterType) &&
    !objectFilterTypeToObjects[
      selectedFilter.filterType as ObjectFilterType
    ].includes(objectType)
  );
};
