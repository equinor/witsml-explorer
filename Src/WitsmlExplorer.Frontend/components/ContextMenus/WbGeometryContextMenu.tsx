import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { UpdateWellboreWbGeometryAction } from "../../contexts/navigationStateReducer";
import WbGeometryPropertiesModal, { WbGeometryPropertiesModalProps } from "../Modals/WbGeometryPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { WbGeometryObjectRow } from "../ContentViews/WbGeometrysListView";

export interface WbGeometryObjectContextMenuProps {
  checkedWbGeometryObjectRows: WbGeometryObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreWbGeometryAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const WbGeometryObjectContextMenu = (props: WbGeometryObjectContextMenuProps): React.ReactElement => {
  const { checkedWbGeometryObjectRows, dispatchOperation } = props;

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyWbGeometryObjectProps: WbGeometryPropertiesModalProps = { mode, wbGeometryObject: checkedWbGeometryObjectRows[0].wbGeometry, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WbGeometryPropertiesModal {...modifyWbGeometryObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedWbGeometryObjectRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};
const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export default WbGeometryObjectContextMenu;
