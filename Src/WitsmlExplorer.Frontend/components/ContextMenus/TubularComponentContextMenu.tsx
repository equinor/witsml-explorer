import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreTubularAction } from "../../contexts/modificationActions";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import { createComponentReferences } from "../../models/jobs/componentReferences";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { TubularComponentRow } from "../ContentViews/TubularView";
import TubularComponentPropertiesModal from "../Modals/TubularComponentPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickDeleteComponents, onClickShowObjectOnServer } from "./ContextMenuUtils";
import { copyComponents, pasteComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { onClickRefresh } from "./TubularContextMenuUtils";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface TubularComponentContextMenuProps {
  checkedTubularComponents: TubularComponentRow[];
  dispatchNavigation: (action: UpdateWellboreTubularAction) => void;
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  tubular: Tubular;
  selectedServer: Server;
  servers: Server[];
}

const TubularComponentContextMenu = (props: TubularComponentContextMenuProps): React.ReactElement => {
  const { checkedTubularComponents, dispatchNavigation, dispatchOperation, tubular, selectedServer, servers } = props;
  const tubularComponentReferences = useClipboardComponentReferencesOfType(ComponentType.TubularComponent);

  const onClickProperties = async () => {
    const tubularComponentPropertiesModalProps = { tubularComponent: checkedTubularComponents[0].tubularComponent, tubular, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TubularComponentPropertiesModal {...tubularComponentPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const toDelete = createComponentReferences(
    checkedTubularComponents.map((tc) => tc.uid),
    tubular,
    ComponentType.TubularComponent
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefresh(tubular, dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh all tubular components</Typography>
        </MenuItem>,
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              selectedServer,
              checkedTubularComponents.map((ts) => ts.uid),
              tubular,
              dispatchOperation,
              ComponentType.TubularComponent
            )
          }
          disabled={checkedTubularComponents.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "tubular component", checkedTubularComponents)}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteComponents(servers, tubularComponentReferences, dispatchOperation, tubular)} disabled={tubularComponentReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "tubular component", tubularComponentReferences?.componentUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteComponents(dispatchOperation, toDelete, JobType.DeleteComponents)} disabled={checkedTubularComponents.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "tubular component", checkedTubularComponents)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowObjectOnServer(dispatchOperation, server, tubular, ObjectType.Tubular)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedTubularComponents.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularComponentContextMenu;
