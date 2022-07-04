import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ListItemIcon, MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { Server } from "../../models/server";
import { RiskObjectRow } from "../ContentViews/RisksListView";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import RiskObjectService from "../../services/riskObjectService";
import { UpdateWellboreRiskAction, UpdateWellboreRisksAction } from "../../contexts/navigationStateReducer";
import RiskPropertiesModal, { RiskPropertiesModalProps } from "../Modals/RiskPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";

export interface RiskContextMenuProps {
  checkedRiskObjectRows: RiskObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreRisksAction | UpdateWellboreRiskAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const RiskContextMenu = (props: RiskContextMenuProps): React.ReactElement => {
  const { checkedRiskObjectRows, dispatchOperation } = props;

  const onClickModify = async () => {
    const riskObject = await RiskObjectService.getRisk(checkedRiskObjectRows[0].wellUid, checkedRiskObjectRows[0].wellboreUid, checkedRiskObjectRows[0].uid);
    const mode = PropertiesModalMode.Edit;
    const modifyRiskProps: RiskPropertiesModalProps = { mode, riskObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RiskPropertiesModal {...modifyRiskProps} /> });
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
        </MenuItem>
      ]}
    />
  );
};

export default RiskContextMenu;
