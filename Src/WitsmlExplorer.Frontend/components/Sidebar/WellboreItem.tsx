import {
  getContextMenuPosition,
  preventContextMenuPropagation
} from "components/ContextMenus/ContextMenu";
import FluidsReportContextMenu from "components/ContextMenus/FluidsReportContextMenu";
import LogsContextMenu, {
  LogsContextMenuProps
} from "components/ContextMenus/LogsContextMenu";
import MudLogContextMenu from "components/ContextMenus/MudLogContextMenu";
import RigContextMenu from "components/ContextMenus/RigContextMenu";
import RigsContextMenu, {
  RigsContextMenuProps
} from "components/ContextMenus/RigsContextMenu";
import TrajectoriesContextMenu, {
  TrajectoriesContextMenuProps
} from "components/ContextMenus/TrajectoriesContextMenu";
import TrajectoryContextMenu from "components/ContextMenus/TrajectoryContextMenu";
import TubularContextMenu from "components/ContextMenus/TubularContextMenu";
import TubularsContextMenu, {
  TubularsContextMenuProps
} from "components/ContextMenus/TubularsContextMenu";
import WbGeometryObjectContextMenu from "components/ContextMenus/WbGeometryContextMenu";
import WellboreContextMenu, {
  WellboreContextMenuProps
} from "components/ContextMenus/WellboreContextMenu";
import ObjectGroupItem from "components/Sidebar/ObjectGroupItem";
import TreeItem from "components/Sidebar/TreeItem";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { ObjectType } from "models/objectType";
import Wellbore from "models/wellbore";
import { MouseEvent, useContext } from "react";
import { getObjectGroupsViewPath } from "routes/utils/pathBuilder";
import styled from "styled-components";
import { WellIndicator } from "../StyledComponents/WellIndicator";

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
  const { servers } = useGetServers();
  const {
    dispatchOperation,
    operationState: { theme }
  } = useContext(OperationContext);
  const isCompactMode = theme === UserTheme.Compact;
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  const { connectedServer } = useConnectedServer();
  const { wellbore, isFetching } = useGetWellbore(
    connectedServer,
    wellUid,
    wellboreUid
  );

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    wellbore: Wellbore
  ) => {
    preventContextMenuPropagation(event);
    const contextMenuProps: WellboreContextMenuProps = {
      servers,
      wellbore
    };
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
    const contextMenuProps: LogsContextMenuProps = {
      dispatchOperation,
      wellbore,
      servers
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

  const getNavPath = () => {
    return getObjectGroupsViewPath(connectedServer?.url, wellUid, wellboreUid);
  };

  return (
    <WellboreLayout>
      <TreeItem
        onContextMenu={(event: MouseEvent<HTMLLIElement>) =>
          onContextMenu(event, wellbore)
        }
        key={nodeId}
        nodeId={nodeId}
        selected={selected}
        labelText={wellbore?.name}
        to={getNavPath()}
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
