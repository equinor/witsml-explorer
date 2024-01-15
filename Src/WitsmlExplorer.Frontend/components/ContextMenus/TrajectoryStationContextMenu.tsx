import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
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
import TrajectoryStationPropertiesModal from "components/Modals/TrajectoryStationPropertiesModal";
import { DispatchNavigation } from "contexts/navigationAction";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import { createComponentReferences } from "models/jobs/componentReferences";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Trajectory from "models/trajectory";
import React from "react";
import { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface TrajectoryStationContextMenuProps {
  checkedTrajectoryStations: TrajectoryStationRow[];
  dispatchNavigation: DispatchNavigation;
  dispatchOperation: DispatchOperation;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectoryStationContextMenu = (
  props: TrajectoryStationContextMenuProps
): React.ReactElement => {
  const {
    checkedTrajectoryStations,
    dispatchOperation,
    trajectory,
    selectedServer,
    servers
  } = props;
  const trajectoryStationReferences = useClipboardComponentReferencesOfType(
    ComponentType.TrajectoryStation
  );

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const trajectoryStationPropertiesModalProps = {
      trajectoryStation: checkedTrajectoryStations[0].trajectoryStation,
      trajectory,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: (
        <TrajectoryStationPropertiesModal
          {...trajectoryStationPropertiesModalProps}
        />
      )
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
              selectedServer,
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
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() =>
                onClickShowObjectOnServer(
                  dispatchOperation,
                  server,
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
