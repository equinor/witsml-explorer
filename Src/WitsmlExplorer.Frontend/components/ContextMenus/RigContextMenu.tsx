import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useContext } from "react";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ObjectType } from "../../models/objectType";
import Rig from "../../models/rig";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import RigPropertiesModal, {
  RigPropertiesModalProps
} from "../Modals/RigPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";

const RigContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();
  const { authorizationState } = useAuthorizationState();
  const queryClient = useQueryClient();

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyRigObjectProps: RigPropertiesModalProps = {
      mode,
      rig: checkedObjects[0] as Rig,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <RigPropertiesModal {...modifyRigObjectProps} />
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
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
          ObjectType.Rig,
          navigationState,
          dispatchOperation,
          queryClient,
          authorizationState?.server?.url,
          openInQueryView,
          wellbore,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default RigContextMenu;
