import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import FormationMarkerPropertiesModal, {
  FormationMarkerPropertiesModalProps
} from "components/Modals/FormationMarkerPropertiesModal";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import FormationMarker from "models/formationMarker";
import { ObjectType } from "models/objectType";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const FormationMarkerContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const modifyFormationMarkerProps: FormationMarkerPropertiesModalProps = {
      formationMarker: checkedObjects[0] as FormationMarker
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: (
        <FormationMarkerPropertiesModal {...modifyFormationMarkerProps} />
      )
    });
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
          ObjectType.FormationMarker,
          navigationState,
          dispatchOperation,
          dispatchNavigation,
          openInQueryView,
          wellbore,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default FormationMarkerContextMenu;
