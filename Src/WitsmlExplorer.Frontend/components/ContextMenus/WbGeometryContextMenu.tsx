import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import WbGeometryObject from "../../models/wbGeometry";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WbGeometryPropertiesModal, { WbGeometryPropertiesModalProps } from "../Modals/WbGeometryPropertiesModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickDeleteObjects, onClickShowObjectOnServer, StyledIcon } from "./ContextMenuUtils";
import { pasteComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface WbGeometryObjectContextMenuProps {
  checkedWbGeometryObjects: WbGeometryObject[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const WbGeometryObjectContextMenu = (props: WbGeometryObjectContextMenuProps): React.ReactElement => {
  const { checkedWbGeometryObjects, dispatchOperation, servers } = props;
  const wbGeometrySectionReferences = useClipboardComponentReferencesOfType(ComponentType.WbGeometrySection);

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyWbGeometryObjectProps: WbGeometryPropertiesModalProps = { mode, wbGeometryObject: checkedWbGeometryObjects[0], dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WbGeometryPropertiesModal {...modifyWbGeometryObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"paste"}
          onClick={() => pasteComponents(servers, wbGeometrySectionReferences, dispatchOperation, checkedWbGeometryObjects[0], JobType.CopyWbGeometrySections)}
          disabled={wbGeometrySectionReferences === null || checkedWbGeometryObjects.length !== 1}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "wbGeometry section", wbGeometrySectionReferences?.componentUids)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"delete"}
          onClick={() => onClickDeleteObjects(dispatchOperation, checkedWbGeometryObjects, ObjectType.WbGeometry)}
          disabled={checkedWbGeometryObjects.length === 0}
        >
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedWbGeometryObjects.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() => onClickShowObjectOnServer(dispatchOperation, server, checkedWbGeometryObjects[0], "wbGeometryUid")}
              disabled={checkedWbGeometryObjects.length !== 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedWbGeometryObjects.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WbGeometryObjectContextMenu;
