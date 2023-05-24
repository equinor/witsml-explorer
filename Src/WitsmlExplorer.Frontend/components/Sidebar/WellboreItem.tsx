import React, { createContext, useContext, useEffect, useState } from "react";
import { SelectWellboreAction, ToggleTreeNodeAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore, { calculateObjectGroupId } from "../../models/wellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import WellboreService from "../../services/wellboreService";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
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
  const { servers, expandedTreeNodes } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState(false);

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

  useEffect(() => {
    if (!isFetchingData) {
      return;
    }
    const controller = new AbortController();

    async function getChildren() {
      const wellboreObjects = await WellboreService.getWellboreObjects(well.uid, wellbore.uid);
      const selectWellbore: SelectWellboreAction = {
        type: NavigationType.SelectWellbore,
        payload: { well, wellbore, ...wellboreObjects }
      };
      dispatchNavigation(selectWellbore);
      setIsFetchingData(false);
    }

    getChildren().catch(truncateAbortHandler);

    return () => {
      controller.abort();
    };
  }, [isFetchingData]);

  const onLabelClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData) {
      const payload = {
        well,
        wellbore,
        bhaRuns: wellbore.bhaRuns,
        changeLogs: wellbore.changeLogs,
        fluidsReports: wellbore.fluidsReports,
        formationMarkers: wellbore.formationMarkers,
        logs: wellbore.logs,
        rigs: wellbore.rigs,
        trajectories: wellbore.trajectories,
        messages: wellbore.messages,
        mudLogs: wellbore.mudLogs,
        risks: wellbore.risks,
        tubulars: wellbore.tubulars,
        wbGeometries: wellbore.wbGeometries
      };
      const selectWellbore: SelectWellboreAction = { type: NavigationType.SelectWellbore, payload };
      dispatchNavigation(selectWellbore);
    } else {
      setIsFetchingData(true);
    }
  };

  const onIconClick = () => {
    const wellboreHasData = wellbore.logs?.length > 0;
    if (wellboreHasData || expandedTreeNodes?.includes(props.nodeId)) {
      const toggleTreeNode: ToggleTreeNodeAction = { type: NavigationType.ToggleTreeNode, payload: { nodeId: props.nodeId } };
      dispatchNavigation(toggleTreeNode);
    } else {
      setIsFetchingData(true);
    }
  };

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
      isLoading={isFetchingData}
    >
      <WellboreItemContext.Provider value={{ wellbore, well }}>
        <ObjectGroupItem objectType={ObjectType.BhaRun} />
        <ObjectGroupItem objectType={ObjectType.ChangeLog} onGroupContextMenu={preventContextMenuPropagation} />
        <ObjectGroupItem objectType={ObjectType.FluidsReport} />
        <ObjectGroupItem objectType={ObjectType.FormationMarker} />
        <TreeItem
          nodeId={calculateObjectGroupId(wellbore, ObjectType.Log)}
          labelText={"Logs"}
          onLabelClick={() => dispatchNavigation({ type: NavigationType.SelectObjectGroup, payload: { well, wellbore, objectType: ObjectType.Log } })}
          onContextMenu={(event) => onLogsContextMenu(event, wellbore)}
          isActive={wellbore.logs && wellbore.logs.some((log) => log.objectGrowing)}
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
