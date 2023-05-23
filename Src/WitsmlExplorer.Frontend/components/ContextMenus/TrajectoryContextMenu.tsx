import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { ComponentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteComponents } from "./CopyUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

const TrajectoryContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const trajectoryStationReferences = useClipboardComponentReferencesOfType(ComponentType.TrajectoryStation);

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(checkedObjects, ObjectType.Trajectory, navigationState, dispatchOperation, wellbore),
        <MenuItem
          key={"paste"}
          onClick={() => pasteComponents(servers, trajectoryStationReferences, dispatchOperation, checkedObjects[0])}
          disabled={trajectoryStationReferences === null || checkedObjects.length !== 1}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "trajectory station", trajectoryStationReferences?.componentUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TrajectoryContextMenu;
