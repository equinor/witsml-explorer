import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import FormationMarker from "../../models/formationMarker";
import { ObjectType } from "../../models/objectType";
import { colors } from "../../styles/Colors";
import FormationMarkerPropertiesModal, { FormationMarkerPropertiesModalProps } from "../Modals/FormationMarkerPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";

const FormationMarkerContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  const onClickModify = async () => {
    const modifyFormationMarkerProps: FormationMarkerPropertiesModalProps = { formationMarker: checkedObjects[0] as FormationMarker };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <FormationMarkerPropertiesModal {...modifyFormationMarkerProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(checkedObjects, ObjectType.FormationMarker, navigationState, wellbore),
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default FormationMarkerContextMenu;
