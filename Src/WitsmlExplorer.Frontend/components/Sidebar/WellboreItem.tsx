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
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import Wellbore from "models/wellbore";
import { MouseEvent } from "react";
import { getObjectGroupsViewPath } from "routes/utils/pathBuilder";
import styled from "styled-components";
import { WellIndicator } from "../StyledComponents/WellIndicator";
import { UidMappingBasicInfo } from "../../models/uidMapping.tsx";
import { Icon, Tooltip } from "@equinor/eds-core-react";

interface WellboreItemProps {
  wellUid: string;
  wellboreUid: string;
  selected: boolean;
  nodeId: string;
  uidMappingBasicInfos: UidMappingBasicInfo[];
}

type ContextEventType = MouseEvent<HTMLLIElement>;

type ContextMenuActionHandler = (
  e: ContextEventType,
  wellbore: Wellbore
) => void;

export default function WellboreItem({
  wellUid,
  wellboreUid,
  selected,
  nodeId,
  uidMappingBasicInfos
}: WellboreItemProps) {
  const { servers } = useGetServers();
  const {
    dispatchOperation,
    operationState: { theme }
  } = useOperationState();

  const {
    operationState: { colors }
  } = useOperationState();
  const { connectedServer } = useConnectedServer();
  const { wellbore, isFetching } = useGetWellbore(
    connectedServer,
    wellUid,
    wellboreUid
  );

  const onContextMenu: ContextMenuActionHandler = (event, wellbore) => {
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

  const onLogsContextMenu: ContextMenuActionHandler = (event, wellbore) => {
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

  const onRigsContextMenu: ContextMenuActionHandler = (event, wellbore) => {
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

  const onTubularsContextMenu: ContextMenuActionHandler = (event, wellbore) => {
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

  const onTrajectoryContextMenu: ContextMenuActionHandler = (
    event,
    wellbore
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
        onContextMenu={(event: ContextEventType) =>
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
      <StatusIconsLayout>
        {!!uidMappingBasicInfos && uidMappingBasicInfos.length > 0 && (
          <Tooltip
            title={
              "UID mapped on servers: " +
              uidMappingBasicInfos.map((i) => i.targetServerName).join(", ")
            }
          >
            <Icon name="link" color={colors.text.staticIconsTertiary} />
          </Tooltip>
        )}
        <WellIndicator
          themeMode={theme}
          active={wellbore?.isActive}
          colors={colors}
        />
      </StatusIconsLayout>
    </WellboreLayout>
  );
}

const WellboreLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 10px;
  justify-content: center;
  align-content: stretch;
`;

const StatusIconsLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem;
  justify-content: center;
`;
