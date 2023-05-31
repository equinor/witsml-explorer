import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import MudLog from "../../models/mudLog";
import { ObjectType } from "../../models/objectType";
import { colors } from "../../styles/Colors";
import MudLogPropertiesModal, { MudLogPropertiesModalProps } from "../Modals/MudLogPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteComponents } from "./CopyUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

const MudLogContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { servers } = navigationState;
  const geologyIntervalReferences = useClipboardComponentReferencesOfType(ComponentType.GeologyInterval);
  const { dispatchOperation } = useContext(OperationContext);

  const onClickModify = async () => {
    const modifyMudLogProps: MudLogPropertiesModalProps = { mudLog: checkedObjects[0] as MudLog };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MudLogPropertiesModal {...modifyMudLogProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(checkedObjects, ObjectType.MudLog, navigationState, dispatchOperation, wellbore),
        <MenuItem
          key={"paste"}
          onClick={() => pasteComponents(servers, geologyIntervalReferences, dispatchOperation, checkedObjects[0])}
          disabled={geologyIntervalReferences === null || checkedObjects.length !== 1}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "geology interval", geologyIntervalReferences?.componentUids)}</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default MudLogContextMenu;
