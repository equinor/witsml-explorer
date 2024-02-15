import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useContext } from "react";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ComponentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import Trajectory from "../../models/trajectory";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TrajectoryPropertiesModal, {
  TrajectoryPropertiesModalProps
} from "../Modals/TrajectoryPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteComponents } from "./CopyUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

const TrajectoryContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const trajectoryStationReferences = useClipboardComponentReferencesOfType(
    ComponentType.TrajectoryStation
  );
  const openInQueryView = useOpenInQueryView();
  const { authorizationState } = useAuthorizationState();
  const queryClient = useQueryClient();

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyObjectProps: TrajectoryPropertiesModalProps = {
      mode,
      trajectory: checkedObjects[0] as Trajectory,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <TrajectoryPropertiesModal {...modifyObjectProps} />
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"paste"}
        onClick={() =>
          pasteComponents(
            servers,
            trajectoryStationReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={
          trajectoryStationReferences === null || checkedObjects.length !== 1
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
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={onClickModify}
        disabled={checkedObjects.length !== 1}
      >
        <StyledIcon name="settings" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>Properties</Typography>
      </MenuItem>
    ];
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.Trajectory,
          authorizationState?.server,
          servers,
          dispatchOperation,
          queryClient,
          openInQueryView,
          wellbore,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default TrajectoryContextMenu;
