import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import NavigationContext from "../../contexts/navigationContext";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Trajectory from "../../models/trajectory";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { StoreFunction, TemplateObjects } from "../ContentViews/QueryViewUtils";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TrajectoryPropertiesModal, {
  TrajectoryPropertiesModalProps
} from "../Modals/TrajectoryPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickRefresh } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface TrajectoriesContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideModalAction | HideContextMenuAction
  ) => void;
  wellbore: Wellbore;
  servers: Server[];
  setIsLoading?: (arg: boolean) => void;
}

const TrajectoriesContextMenu = (
  props: TrajectoriesContextMenuProps
): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, setIsLoading } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const trajectoryReferences = useClipboardReferencesOfType(
    ObjectType.Trajectory
  );
  const openInQueryView = useOpenInQueryView();

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
      trajectoryStations: [],
      commonData: null
    };
    const trajectoryPropertiesModalProps: TrajectoryPropertiesModalProps = {
      mode: PropertiesModalMode.New,
      trajectory: newTrajectory,
      dispatchOperation
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <TrajectoryPropertiesModal {...trajectoryPropertiesModalProps} />
    };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        setIsLoading ? (
          <MenuItem
            key={"refresh"}
            onClick={() =>
              onClickRefresh(
                dispatchOperation,
                dispatchNavigation,
                wellbore.wellUid,
                wellbore.uid,
                ObjectType.Trajectory,
                setIsLoading
              )
            }
          >
            <StyledIcon
              name="refresh"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>{`Refresh Trajectories`}</Typography>
          </MenuItem>
        ) : null,
        <MenuItem key={"newTrajectory"} onClick={onClickNewTrajectory}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Trajectory</Typography>
        </MenuItem>,
        <MenuItem
          key={"pasteTrajectory"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              trajectoryReferences,
              dispatchOperation,
              wellbore
            )
          }
          disabled={trajectoryReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              "trajectory",
              trajectoryReferences?.objectUids
            )}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Trajectory,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: wellbore.uid,
                  objectUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Trajectory</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TrajectoriesContextMenu;
