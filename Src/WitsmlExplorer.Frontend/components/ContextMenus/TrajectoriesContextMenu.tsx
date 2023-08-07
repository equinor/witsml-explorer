import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickRefresh, StyledIcon } from "./ContextMenuUtils";
import TrajectoryPropertiesModal, { TrajectoryPropertiesModalProps } from "../Modals/TrajectoryPropertiesModal";
import { ObjectType } from "../../models/objectType";
import { pasteObjectOnWellbore } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";
import NavigationContext from "../../contexts/navigationContext";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";

export interface TrajectoriesContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  wellbore: Wellbore;
  servers: Server[];
  setIsLoading?: (arg: boolean) => void;
}

const TrajectoriesContextMenu = (props: TrajectoriesContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, setIsLoading } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const trajectoryReferences = useClipboardReferencesOfType(ObjectType.Trajectory);

  const onClickNewTrajectory = () => {
    const newTrajectory: Trajectory = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      serviceCompany: "",
      aziRef: "",
      dTimTrajEnd: "",
      dTimTrajStart: "",
      mdMax: null,
      mdMin: null,
      trajectoryStations: []
    };
    const trajectoryPropertiesModalProps: TrajectoryPropertiesModalProps = { mode: PropertiesModalMode.New, trajectory: newTrajectory, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <TrajectoryPropertiesModal {...trajectoryPropertiesModalProps} /> };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        setIsLoading ? (
          <MenuItem key={"refresh"} onClick={() => onClickRefresh(dispatchOperation, dispatchNavigation, wellbore.wellUid, wellbore.uid, ObjectType.Trajectory, setIsLoading)}>
            <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
            <Typography color={"primary"}>{`Refresh Trajectories`}</Typography>
          </MenuItem>
        ) : null,
        <MenuItem key={"newTrajectory"} onClick={onClickNewTrajectory}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Trajectory</Typography>
        </MenuItem>,
        <MenuItem
          key={"pasteTrajectory"}
          onClick={() => pasteObjectOnWellbore(servers, trajectoryReferences, dispatchOperation, wellbore)}
          disabled={trajectoryReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory", trajectoryReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoriesContextMenu;
