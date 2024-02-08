import { useTheme } from "@material-ui/core";
import { MouseEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { SelectWellboreAction } from "../../contexts/navigationActions";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useServers } from "../../contexts/serversContext";
import { useSidebar } from "../../contexts/sidebarContext";
import { SidebarActionType } from "../../contexts/sidebarReducer";
import { useGetWell } from "../../hooks/query/useGetWell";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { ObjectType } from "../../models/objectType";
import Wellbore from "../../models/wellbore";
import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "../ContextMenus/ContextMenu";
import FluidsReportContextMenu from "../ContextMenus/FluidsReportContextMenu";
import LogsContextMenu, {
  LogsContextMenuProps
} from "../ContextMenus/LogsContextMenu";
import MudLogContextMenu from "../ContextMenus/MudLogContextMenu";
import RigContextMenu from "../ContextMenus/RigContextMenu";
import RigsContextMenu, {
  RigsContextMenuProps
} from "../ContextMenus/RigsContextMenu";
import TrajectoriesContextMenu, {
  TrajectoriesContextMenuProps
} from "../ContextMenus/TrajectoriesContextMenu";
import TrajectoryContextMenu from "../ContextMenus/TrajectoryContextMenu";
import TubularContextMenu from "../ContextMenus/TubularContextMenu";
import TubularsContextMenu, {
  TubularsContextMenuProps
} from "../ContextMenus/TubularsContextMenu";
import WbGeometryObjectContextMenu from "../ContextMenus/WbGeometryContextMenu";
import WellboreContextMenu, {
  WellboreContextMenuProps
} from "../ContextMenus/WellboreContextMenu";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import ObjectGroupItem from "./ObjectGroupItem";
import { WellIndicator } from "./Sidebar";
import TreeItem from "./TreeItem";

interface WellboreItemProps {
  wellUid: string;
  wellboreUid: string;
  selected: boolean;
  nodeId: string;
}

export default function WellboreItem({
  wellUid,
  wellboreUid,
  selected,
  nodeId
}: WellboreItemProps) {
  const { dispatchNavigation } = useContext(NavigationContext);
  const { servers } = useServers();
  const { dispatchOperation } = useContext(OperationContext);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { authorizationState } = useAuthorizationState();
  const navigate = useNavigate();
  const { dispatchSidebar } = useSidebar();
  const { well, isFetching: isFetchingWell } = useGetWell(
    authorizationState?.server,
    wellUid
  );
  const { wellbore, isFetching: isFetchingWellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );
  const isFetching = isFetchingWell || isFetchingWellbore;

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = { wellbore, well };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WellboreContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onLogsContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => {
    preventContextMenuPropagation(event);
    const indexCurve = IndexCurve.Depth;
    const contextMenuProps: LogsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      indexCurve
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogsContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onRigsContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: RigsContextMenuProps = {
      wellbore,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <RigsContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onTubularsContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TubularsContextMenuProps = {
      wellbore,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <TubularsContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onTrajectoryContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TrajectoriesContextMenuProps = {
      wellbore,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <TrajectoriesContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const onLabelClick = () => {
    const selectWellbore: SelectWellboreAction = {
      type: NavigationType.SelectWellbore,
      payload: { well, wellbore }
    };
    dispatchNavigation(selectWellbore);
    navigate(
      `servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups`
    );
  };

  const onIconClick = () => {
    dispatchSidebar({
      type: SidebarActionType.ToggleTreeNode,
      payload: { nodeId: nodeId }
    });
  };

  // TODO: Continue passing down only the uids (remove the provider?) to make the components more independent, and so they can calculate their own loading states.

  return (
    <WellboreLayout>
      <TreeItem
        onContextMenu={(event) => onContextMenu(event, wellbore)}
        key={nodeId}
        nodeId={nodeId}
        selected={selected}
        labelText={wellbore?.name}
        onLabelClick={onLabelClick}
        onIconClick={onIconClick}
        isLoading={isFetching}
      >
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.BhaRun}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.ChangeLog}
          onGroupContextMenu={preventContextMenuPropagation}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.FluidsReport}
          ObjectContextMenu={FluidsReportContextMenu}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.FormationMarker}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.Log}
          onGroupContextMenu={(event) => onLogsContextMenu(event, wellbore)}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.Message}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.MudLog}
          ObjectContextMenu={MudLogContextMenu}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.Rig}
          ObjectContextMenu={RigContextMenu}
          onGroupContextMenu={(event) => onRigsContextMenu(event, wellbore)}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.Risk}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.Trajectory}
          ObjectContextMenu={TrajectoryContextMenu}
          onGroupContextMenu={(event) =>
            onTrajectoryContextMenu(event, wellbore)
          }
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.Tubular}
          ObjectContextMenu={TubularContextMenu}
          onGroupContextMenu={(event) => onTubularsContextMenu(event, wellbore)}
        />
        <ObjectGroupItem
          wellUid={wellUid}
          wellboreUid={wellboreUid}
          objectType={ObjectType.WbGeometry}
          ObjectContextMenu={WbGeometryObjectContextMenu}
        />
      </TreeItem>
      <WellIndicator
        compactMode={isCompactMode}
        active={wellbore?.isActive}
        colors={colors}
      />
    </WellboreLayout>
  );
}

const WellboreLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 0px;
  justify-content: center;
  align-content: stretch;
`;
