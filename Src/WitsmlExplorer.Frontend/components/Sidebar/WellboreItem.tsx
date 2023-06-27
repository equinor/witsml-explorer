import { useTheme } from "@material-ui/core";
import React, { createContext, useCallback, useContext, useState } from "react";
import styled from "styled-components";
import ModificationType from "../../contexts/modificationType";
import { SelectWellboreAction, ToggleTreeNodeAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import { getContextMenuPosition, preventContextMenuPropagation } from "../ContextMenus/ContextMenu";
import FluidsReportContextMenu from "../ContextMenus/FluidsReportContextMenu";
import LogsContextMenu, { LogsContextMenuProps } from "../ContextMenus/LogsContextMenu";
import RigsContextMenu, { RigsContextMenuProps } from "../ContextMenus/RigsContextMenu";
import MudLogContextMenu from "../ContextMenus/MudLogContextMenu";
import TrajectoryContextMenu from "../ContextMenus/TrajectoryContextMenu";
import TubularContextMenu from "../ContextMenus/TubularContextMenu";
import TubularsContextMenu, { TubularsContextMenuProps } from "../ContextMenus/TubularsContextMenu";
import WbGeometryObjectContextMenu from "../ContextMenus/WbGeometryContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import LogTypeItem from "./LogTypeItem";
import ObjectGroupItem from "./ObjectGroupItem";
import { ActiveWellIndicator, InactiveWellInidcator } from "./Sidebar";
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
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = { wellbore, well };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const onLogsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore, setIsLoading?: (arg: boolean) => void) => {
    preventContextMenuPropagation(event);
    const indexCurve = IndexCurve.Depth;
    const contextMenuProps: LogsContextMenuProps = { dispatchOperation, wellbore, servers, indexCurve, setIsLoading };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogsContextMenu {...contextMenuProps} />, position } });
  };

  const onRigsContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: RigsContextMenuProps = { dispatchOperation, wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <RigsContextMenu {...contextMenuProps} />, position } });
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
      dispatchNavigation({ type: ModificationType.UpdateWellborePartial, payload: { wellboreUid: wellbore.uid, wellUid: well.uid, wellboreProperties: { objectCount } } });
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

  return (
    <WellboreLayout>
      <TreeItem
        onContextMenu={(event) => onContextMenu(event, wellbore)}
        key={nodeId}
        nodeId={nodeId}
        selected={selected}
        labelText={wellbore.name}
        onLabelClick={onLabelClick}
        onIconClick={onIconClick}
        isLoading={isFetchingCount}
      >
        <WellboreItemContext.Provider value={{ wellbore, well }}>
          <ObjectGroupItem objectType={ObjectType.BhaRun} />
          <ObjectGroupItem objectType={ObjectType.ChangeLog} onGroupContextMenu={preventContextMenuPropagation} />
          <ObjectGroupItem objectsOnWellbore={wellbore?.fluidsReports} objectType={ObjectType.FluidsReport} ObjectContextMenu={FluidsReportContextMenu} />
          <ObjectGroupItem objectType={ObjectType.FormationMarker} />
          <ObjectGroupItem
            objectType={ObjectType.Log}
            onGroupContextMenu={(event, _, setIsLoading) => onLogsContextMenu(event, wellbore, setIsLoading)}
            isActive={wellbore.logs && wellbore.logs.some((log) => log.objectGrowing)}
          >
            <LogTypeItem />
          </ObjectGroupItem>
          <ObjectGroupItem objectType={ObjectType.Message} />
          <ObjectGroupItem objectsOnWellbore={wellbore?.mudLogs} objectType={ObjectType.MudLog} ObjectContextMenu={MudLogContextMenu} />
          <ObjectGroupItem objectType={ObjectType.Rig} onGroupContextMenu={(event) => onRigsContextMenu(event, wellbore)} />
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
      {wellbore.isActive ? <ActiveWellIndicator compactMode={isCompactMode} /> : <InactiveWellInidcator compactMode={isCompactMode} />}
    </WellboreLayout>
  );
};

const WellboreLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 0px;
  justify-content: center;
  align-content: stretch;
`;
export default WellboreItem;
