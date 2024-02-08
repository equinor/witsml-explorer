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
import Tubular from "../../models/tubular";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TubularPropertiesModal from "../Modals/TubularPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteComponents } from "./CopyUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

const TubularContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const tubularComponentReferences = useClipboardComponentReferencesOfType(
    ComponentType.TubularComponent
  );
  const openInQueryView = useOpenInQueryView();
  const { authorizationState } = useAuthorizationState();
  const queryClient = useQueryClient();

  const onClickProperties = async () => {
    const tubularPropertiesModalProps = {
      mode: PropertiesModalMode.Edit,
      tubular: checkedObjects[0] as Tubular,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <TubularPropertiesModal {...tubularPropertiesModalProps} />
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
            tubularComponentReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={
          tubularComponentReferences === null || checkedObjects.length !== 1
        }
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText(
            "paste",
            "tubular component",
            tubularComponentReferences?.componentUids
          )}
        </Typography>
      </MenuItem>,
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={onClickProperties}
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
          ObjectType.Tubular,
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

export default TubularContextMenu;
