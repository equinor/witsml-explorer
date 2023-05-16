import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import GeologyInterval from "../../models/geologyInterval";
import { createComponentReferences } from "../../models/jobs/componentReferences";
import MudLog from "../../models/mudLog";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import GeologyIntervalPropertiesModal from "../Modals/GeologyIntervalPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickDeleteComponents } from "./ContextMenuUtils";
import { copyComponents, pasteComponents } from "./CopyUtils";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface GeologyIntervalContextMenuProps {
  checkedGeologyIntervals: GeologyInterval[];
}

const GeologyIntervalContextMenu = (props: GeologyIntervalContextMenuProps): React.ReactElement => {
  const { checkedGeologyIntervals } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const {
    navigationState: { selectedServer, selectedObject, servers }
  } = useContext(NavigationContext);
  const geologyIntervalReferences = useClipboardComponentReferencesOfType(ComponentType.GeologyInterval);
  const selectedMudLog = selectedObject as MudLog;

  const onClickProperties = async () => {
    const geologyIntervalPropertiesModalProps = { geologyInterval: checkedGeologyIntervals[0] };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <GeologyIntervalPropertiesModal {...geologyIntervalPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const toDelete = createComponentReferences(
    checkedGeologyIntervals.map((gi) => gi.uid),
    selectedMudLog,
    ComponentType.GeologyInterval
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              selectedServer,
              checkedGeologyIntervals.map((gi) => gi.uid),
              selectedMudLog,
              dispatchOperation,
              ComponentType.GeologyInterval
            )
          }
          disabled={checkedGeologyIntervals.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "geology interval", checkedGeologyIntervals)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() => pasteComponents(servers, geologyIntervalReferences, dispatchOperation, selectedMudLog, JobType.CopyGeologyIntervals)}
          disabled={geologyIntervalReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "geology interval", geologyIntervalReferences?.componentUids)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"delete"}
          onClick={() => onClickDeleteComponents(dispatchOperation, toDelete, JobType.DeleteGeologyIntervals)}
          disabled={checkedGeologyIntervals.length === 0}
        >
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "geology interval", checkedGeologyIntervals)}</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedGeologyIntervals.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default GeologyIntervalContextMenu;
