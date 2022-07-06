import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import RiskObjectService from "../../services/riskObjectService";
import { UpdateWellboreRiskAction, UpdateWellboreRisksAction } from "../../contexts/navigationStateReducer";
import RiskPropertiesModal, { RiskPropertiesModalProps } from "../Modals/RiskPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import RiskObject from "../../models/riskObject";
import { onClickDelete } from "./RiskContextMenuUtils";

export interface RiskObjectContextMenuProps {
  checkedRiskObjectRows: RiskObject[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreRisksAction | UpdateWellboreRiskAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const RiskObjectContextMenu = (props: RiskObjectContextMenuProps): React.ReactElement => {
  const { checkedRiskObjectRows, dispatchOperation, dispatchNavigation } = props;

  const onClickModify = async () => {
    const riskObject = await RiskObjectService.getRisk(checkedRiskObjectRows[0].wellUid, checkedRiskObjectRows[0].wellboreUid, checkedRiskObjectRows[0].uid);
    const mode = PropertiesModalMode.Edit;
    const modifyRiskObjectProps: RiskPropertiesModalProps = { mode, riskObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RiskPropertiesModal {...modifyRiskObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"modify"} onClick={onClickModify} disabled={checkedRiskObjectRows.length !== 1}>
          <ListItemIcon>
            <Icon name="formatLine" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Modify</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDelete(checkedRiskObjectRows, dispatchOperation, dispatchNavigation)} disabled={checkedRiskObjectRows.length === 0}>
          <ListItemIcon>
            <Icon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RiskObjectContextMenu;
