import { useTheme } from "@material-ui/core";
import { MouseEvent, useContext, useState } from "react";
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
import { WellboreItemProvider } from "../../contexts/wellboreItemContext";
import { ObjectType } from "../../models/objectType";
import Well from "../../models/well";
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
  well: Well;
  wellbore: Wellbore;
  selected: boolean;
  nodeId: string;
}

export default function WellboreItem({
  well,
  wellbore,
  selected,
  nodeId
}: WellboreItemProps) {
  const { dispatchNavigation } = useContext(NavigationContext);
  const { servers } = useServers();
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { authorizationState } = useAuthorizationState();
  const navigate = useNavigate();
  const { dispatchSidebar } = useSidebar();

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
    wellbore: Wellbore,
    setIsLoading: (arg: boolean) => void
  ) => {
    preventContextMenuPropagation(event);
    const indexCurve = IndexCurve.Depth;
    const contextMenuProps: LogsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      indexCurve,
      setIsLoading
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
    wellbore: Wellbore,
    setIsLoading: (arg: boolean) => void
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: RigsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      setIsLoading
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
    wellbore: Wellbore,
    setIsLoading: (arg: boolean) => void
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TubularsContextMenuProps = {
      dispatchNavigation,
      dispatchOperation,
      wellbore,
      servers,
      setIsLoading
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
    wellbore: Wellbore,
    setIsLoading: (arg: boolean) => void
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: TrajectoriesContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers,
      setIsLoading
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
      `servers/${encodeURIComponent(authorizationState.server.url)}/wells/${
        well.uid
      }/wellbores/${wellbore.uid}/objectgroups`
    );
  };

  const onIconClick = () => {
    dispatchSidebar({
      type: SidebarActionType.ToggleTreeNode,
      payload: { nodeId: nodeId }
    });
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
        <WellboreItemProvider
          well={well}
          wellbore={wellbore}
          setIsFetchingCount={setIsFetchingCount}
        >
          <ObjectGroupItem
            objectType={ObjectType.BhaRun}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.BhaRun
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.ChangeLog}
            onGroupContextMenu={preventContextMenuPropagation}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.ChangeLog
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.FluidsReport}
            ObjectContextMenu={FluidsReportContextMenu}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.FluidsReport
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.FormationMarker}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.FormationMarker
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.Log}
            onGroupContextMenu={(event, _, setIsLoading) =>
              onLogsContextMenu(event, wellbore, setIsLoading)
            }
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Log
            }/logtypes`}
          />
          <ObjectGroupItem
            objectType={ObjectType.Message}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Message
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.MudLog}
            ObjectContextMenu={MudLogContextMenu}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.MudLog
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.Rig}
            ObjectContextMenu={RigContextMenu}
            onGroupContextMenu={(event, _, setIsLoading) =>
              onRigsContextMenu(event, wellbore, setIsLoading)
            }
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Rig
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.Risk}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Risk
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.Trajectory}
            ObjectContextMenu={TrajectoryContextMenu}
            onGroupContextMenu={(event, _, setIsLoading) =>
              onTrajectoryContextMenu(event, wellbore, setIsLoading)
            }
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Trajectory
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.Tubular}
            ObjectContextMenu={TubularContextMenu}
            onGroupContextMenu={(event, _, setIsLoading) =>
              onTubularsContextMenu(event, wellbore, setIsLoading)
            }
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.Tubular
            }/objects`}
          />
          <ObjectGroupItem
            objectType={ObjectType.WbGeometry}
            ObjectContextMenu={WbGeometryObjectContextMenu}
            to={`servers/${encodeURIComponent(
              authorizationState.server.url
            )}/wells/${well.uid}/wellbores/${wellbore.uid}/objectgroups/${
              ObjectType.WbGeometry
            }/objects`}
          />
        </WellboreItemProvider>
      </TreeItem>
      <WellIndicator
        compactMode={isCompactMode}
        active={wellbore.isActive}
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
