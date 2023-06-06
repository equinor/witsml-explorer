import React, { createContext, useCallback, useContext, useState } from "react";
import ModificationType from "../../contexts/modificationType";
import { SelectObjectGroupAction, SelectWellboreAction, ToggleTreeNodeAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, { calculateObjectGroupId, getObjectsFromWellbore } from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import FluidsReportContextMenu from "../ContextMenus/FluidsReportContextMenu";
import LogsContextMenu, { LogsContextMenuProps } from "../ContextMenus/LogsContextMenu";
import MudLogContextMenu from "../ContextMenus/MudLogContextMenu";
import TrajectoryContextMenu from "../ContextMenus/TrajectoryContextMenu";
import TubularContextMenu from "../ContextMenus/TubularContextMenu";
import TubularsContextMenu, { TubularsContextMenuProps } from "../ContextMenus/TubularsContextMenu";
import WbGeometryObjectContextMenu from "../ContextMenus/WbGeometryContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import LogTypeItem from "./LogTypeItem";
import ObjectGroupItem from "./ObjectGroupItem";
import TreeItem from "./TreeItem";

interface WellboreItemProps {
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  nodeId: string;
}

export interface WellboreItemContextProps {
  well: Well;
  wellbore: Wellbore;
}

export const WellboreItemContext = createContext<WellboreItemContextProps>({} as WellboreItemContextProps);

const WellboreItem = (props: WellboreItemProps): React.ReactElement => {
  const { wellbore, well, selected, nodeId } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [isFetchingCount, setIsFetchingCount] = useState(false);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = { wellbore, servers, dispatchOperation, dispatchNavigation };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const onLogsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const indexCurve = IndexCurve.Depth;
    const contextMenuProps: LogsContextMenuProps = { dispatchOperation, wellbore, servers, indexCurve };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogsContextMenu {...contextMenuProps} />, position } });
  };

  const onTubularsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TubularsContextMenuProps = { dispatchNavigation, dispatchOperation, wellbore, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularsContextMenu {...contextMenuProps} />, position } });
  };

  const getExpandableObjectCount = useCallback(async () => {
    if (wellbore.objectCount == null) {
      setIsFetchingCount(true);
      const objectCount = await ObjectService.getExpandableObjectsCount(wellbore);
      dispatchNavigation({ type: ModificationType.UpdateWellbore, payload: { wellbore: { ...wellbore, objectCount } } });
      setIsFetchingCount(false);
    }
  }, [wellbore]);

  const onLabelClick = () => {
    const selectWellbore: SelectWellboreAction = { type: NavigationType.SelectWellbore, payload: { well, wellbore } };
    dispatchNavigation(selectWellbore);
    getExpandableObjectCount();
  };

  const onIconClick = () => {
    const toggleTreeNode: ToggleTreeNodeAction = { type: NavigationType.ToggleTreeNode, payload: { nodeId } };
    dispatchNavigation(toggleTreeNode);
    getExpandableObjectCount();
  };

  const onClickLogs = async () => {
    setIsFetchingLogs(true);
    const objects = await ObjectService.getObjectsIfMissing(wellbore, ObjectType.Log);
    const action: SelectObjectGroupAction = { type: NavigationType.SelectObjectGroup, payload: { objectType: ObjectType.Log, well, wellbore, objects } };
    dispatchNavigation(action);
    setIsFetchingLogs(false);
  };

  const onClickLogsIcon = useCallback(async () => {
    const objects = getObjectsFromWellbore(wellbore, ObjectType.Log);
    if (objects == null || objects.length == 0) {
      setIsFetchingLogs(true);
      const fetchedObjects = await ObjectService.getObjects(wellbore.wellUid, wellbore.uid, ObjectType.Log);
      dispatchNavigation({
        type: ModificationType.UpdateWellboreObjects,
        payload: { wellboreObjects: fetchedObjects, wellUid: well.uid, wellboreUid: wellbore.uid, objectType: ObjectType.Log }
      });
      setIsFetchingLogs(false);
    }
    const toggleTreeNode: ToggleTreeNodeAction = { type: NavigationType.ToggleTreeNode, payload: { nodeId: calculateObjectGroupId(wellbore, ObjectType.Log) } };
    dispatchNavigation(toggleTreeNode);
  }, [well, wellbore]);

  return (
    <TreeItem
      onContextMenu={(event) => onContextMenu(event, wellbore)}
      key={nodeId}
      nodeId={nodeId}
      selected={selected}
      labelText={wellbore.name}
      onLabelClick={onLabelClick}
      onIconClick={onIconClick}
      isActive={wellbore.isActive}
      isLoading={isFetchingCount}
    >
      <WellboreItemContext.Provider value={{ wellbore, well }}>
        <ObjectGroupItem objectType={ObjectType.BhaRun} />
        <ObjectGroupItem objectType={ObjectType.ChangeLog} onGroupContextMenu={preventContextMenuPropagation} />
        <ObjectGroupItem objectsOnWellbore={wellbore?.fluidsReports} objectType={ObjectType.FluidsReport} ObjectContextMenu={FluidsReportContextMenu} />
        <ObjectGroupItem objectType={ObjectType.FormationMarker} />
        <TreeItem
          nodeId={calculateObjectGroupId(wellbore, ObjectType.Log)}
          labelText={"Logs"}
          onLabelClick={onClickLogs}
          onIconClick={onClickLogsIcon}
          onContextMenu={(event) => onLogsContextMenu(event, wellbore)}
          isActive={wellbore.logs && wellbore.logs.some((log) => log.objectGrowing)}
          isLoading={isFetchingLogs}
        >
          <LogTypeItem />
        </TreeItem>
        <ObjectGroupItem objectType={ObjectType.Message} />
        <ObjectGroupItem objectsOnWellbore={wellbore?.mudLogs} objectType={ObjectType.MudLog} ObjectContextMenu={MudLogContextMenu} />
        <ObjectGroupItem objectType={ObjectType.Rig} />
        <ObjectGroupItem objectType={ObjectType.Risk} />
        <ObjectGroupItem objectsOnWellbore={wellbore?.trajectories} objectType={ObjectType.Trajectory} ObjectContextMenu={TrajectoryContextMenu} />
        <ObjectGroupItem
          objectsOnWellbore={wellbore?.tubulars}
          objectType={ObjectType.Tubular}
          ObjectContextMenu={TubularContextMenu}
          onGroupContextMenu={(event) => onTubularsContextMenu(event, wellbore)}
        />
        <ObjectGroupItem objectsOnWellbore={wellbore?.wbGeometries} objectType={ObjectType.WbGeometry} ObjectContextMenu={WbGeometryObjectContextMenu} />
      </WellboreItemContext.Provider>
    </TreeItem>
  );
};

export default WellboreItem;
