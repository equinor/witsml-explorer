import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { WbGeometryObjectRow } from "../ContentViews/WbGeometrysListView";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WbGeometryPropertiesModal, { WbGeometryPropertiesModalProps } from "../Modals/WbGeometryPropertiesModal";
import ContextMenu from "./ContextMenu";
import { onClickDelete, onClickShowOnServer, StyledIcon } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface WbGeometryObjectContextMenuProps {
  checkedWbGeometryObjectRows: WbGeometryObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const WbGeometryObjectContextMenu = (props: WbGeometryObjectContextMenuProps): React.ReactElement => {
  const { checkedWbGeometryObjectRows, dispatchOperation, servers } = props;

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyWbGeometryObjectProps: WbGeometryPropertiesModalProps = { mode, wbGeometryObject: checkedWbGeometryObjectRows[0].wbGeometry, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WbGeometryPropertiesModal {...modifyWbGeometryObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"delete"}
          onClick={() => onClickDelete(dispatchOperation, checkedWbGeometryObjectRows, ObjectType.WbGeometry, JobType.DeleteWbGeometrys)}
          disabled={checkedWbGeometryObjectRows.length === 0}
        >
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedWbGeometryObjectRows.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() => onClickShowOnServer(dispatchOperation, server, checkedWbGeometryObjectRows[0], "wbGeometryUid")}
              disabled={checkedWbGeometryObjectRows.length !== 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedWbGeometryObjectRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WbGeometryObjectContextMenu;
