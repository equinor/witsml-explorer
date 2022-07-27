import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { UpdateWellboreBhaRunsAction } from "../../contexts/navigationStateReducer";
import BhaRunPropertiesModal, { BhaRunPropertiesModalProps } from "../Modals/BhaRunPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { BhaRunRow } from "../ContentViews/BhaRunsListView";

export interface BhaRunContextMenuProps {
  checkedBhaRunRows: BhaRunRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreBhaRunsAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const BhaRunContextMenu = (props: BhaRunContextMenuProps): React.ReactElement => {
  const { checkedBhaRunRows, dispatchOperation } = props;

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyBhaRunProps: BhaRunPropertiesModalProps = { mode, bhaRun: checkedBhaRunRows[0].bhaRun, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <BhaRunPropertiesModal {...modifyBhaRunProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedBhaRunRows.length !== 1}>
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

export default BhaRunContextMenu;
