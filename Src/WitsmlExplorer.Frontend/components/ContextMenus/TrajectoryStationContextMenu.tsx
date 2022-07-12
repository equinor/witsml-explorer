import React from "react";
import ContextMenu from "./ContextMenu";
import { MenuItem } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import Trajectory from "../../models/trajectory";
import TrajectoryStationPropertiesModal from "../Modals/TrajectoryStationPropertiesModal";
import { TrajectoryStationRow } from "../ContentViews/TrajectoryView";

export interface TrajectoryStationContextMenuProps {
  checkedTrajectoryStations: TrajectoryStationRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  trajectory: Trajectory;
  selectedServer: Server;
  servers: Server[];
}

const TrajectoryStationContextMenu = (props: TrajectoryStationContextMenuProps): React.ReactElement => {
  const { checkedTrajectoryStations, dispatchOperation, trajectory } = props;

  const onClickProperties = async () => {
    const TrajectoryStationPropertiesModalProps = { trajectoryStation: checkedTrajectoryStations[0].trajectoryStation, trajectory, dispatchOperation };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <TrajectoryStationPropertiesModal {...TrajectoryStationPropertiesModalProps} />
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedTrajectoryStations.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export default TrajectoryStationContextMenu;
