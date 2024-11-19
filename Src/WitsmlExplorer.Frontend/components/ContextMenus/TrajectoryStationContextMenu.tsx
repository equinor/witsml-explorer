import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
import { TrajectoryStationRow } from "components/ContentViews/TrajectoryView";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickShowObjectOnServer
} from "components/ContextMenus/ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "components/ContextMenus/CopyComponentsToServer";
import {
  copyComponents,
  pasteComponents
} from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getTrajectoryStationProperties } from "components/Modals/PropertiesModal/Properties/TrajectoryStationProperties";
import { PropertiesModal } from "components/Modals/PropertiesModal/PropertiesModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { ComponentType } from "models/componentType";
import { createComponentReferences } from "models/jobs/componentReferences";
import ObjectReference from "models/jobs/objectReference";
import { toObjectReference } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Trajectory from "models/trajectory";
import TrajectoryStation from "models/trajectoryStation";
import React from "react";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface TrajectoryStationContextMenuProps {
  checkedTrajectoryStations: TrajectoryStationRow[];
  trajectory: Trajectory;
}

const TrajectoryStationContextMenu = (
  props: TrajectoryStationContextMenuProps
): React.ReactElement => {
  const { checkedTrajectoryStations, trajectory } = props;
  const { dispatchOperation } = useOperationState();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { connectedServer } = useConnectedServer();
  const trajectoryStationReferences = useClipboardComponentReferencesOfType(
    ComponentType.TrajectoryStation
  );

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const trajectoryStation = checkedTrajectoryStations[0].trajectoryStation;
    const trajectoryStationPropertiesModalProps = {
      title: `Edit properties for Trajectory Station for Trajectory ${trajectoryStation.uid} - ${trajectoryStation.typeTrajStation}`,
      properties: getTrajectoryStationProperties(PropertiesModalMode.Edit),
      object: trajectoryStation,
      onSubmit: async (updates: Partial<TrajectoryStation>) => {
        dispatchOperation({ type: OperationType.HideModal });
        const trajectoryReference: ObjectReference =
          toObjectReference(trajectory);
        const modifyTrajectoryStationJob = {
          trajectoryStation: {
            ...trajectoryStation,
            ...updates
          },
          trajectoryReference
        };
        await JobService.orderJob(
          JobType.ModifyTrajectoryStation,
          modifyTrajectoryStationJob
        );
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <PropertiesModal {...trajectoryStationPropertiesModalProps} />
    });
  };

  const toDelete = createComponentReferences(
    checkedTrajectoryStations.map((ts) => ts.uid),
    trajectory,
    ComponentType.TrajectoryStation
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              connectedServer,
              checkedTrajectoryStations.map((ts) => ts.uid),
              trajectory,
              dispatchOperation,
              ComponentType.TrajectoryStation
            )
          }
          disabled={checkedTrajectoryStations.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "copy",
              "trajectory station",
              checkedTrajectoryStations
            )}
          </Typography>
        </MenuItem>,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.TrajectoryStation}
          componentsToCopy={checkedTrajectoryStations}
          sourceParent={trajectory}
        />,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteComponents(
              servers,
              trajectoryStationReferences,
              dispatchOperation,
              trajectory
            )
          }
          disabled={trajectoryStationReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              "trajectory station",
              trajectoryStationReferences?.componentUids
            )}
          </Typography>
        </MenuItem>,
        <MenuItem
          key={"delete"}
          onClick={() =>
            onClickDeleteComponents(
              dispatchOperation,
              toDelete,
              JobType.DeleteComponents
            )
          }
          disabled={checkedTrajectoryStations.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText(
              "delete",
              "trajectory station",
              checkedTrajectoryStations
            )}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {filteredServers
            .filter((server: Server) => server.id != connectedServer.id)
            .map((server: Server) => (
              <MenuItem
                key={server.name}
                onClick={() =>
                  onClickShowObjectOnServer(
                    dispatchOperation,
                    server,
                    connectedServer,
                    trajectory,
                    ObjectType.Trajectory
                  )
                }
              >
                <Typography color={"primary"}>{server.name}</Typography>
              </MenuItem>
            ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={onClickProperties}
          disabled={checkedTrajectoryStations.length !== 1}
        >
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoryStationContextMenu;
