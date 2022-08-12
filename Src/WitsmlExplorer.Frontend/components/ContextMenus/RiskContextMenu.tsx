import React from "react";
import { DisplayModalAction, HideModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Divider, MenuItem } from "@material-ui/core";
import ContextMenu from "./ContextMenu";
import { colors } from "../../styles/Colors";
import RiskPropertiesModal, { RiskPropertiesModalProps } from "../Modals/RiskPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import { Typography } from "@equinor/eds-core-react";
import { onClickDelete } from "./RiskContextMenuUtils";
import { RiskObjectRow } from "../ContentViews/RisksListView";
import { StyledIcon } from "./ContextMenuUtils";

export interface RiskObjectContextMenuProps {
  checkedRiskObjectRows: RiskObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
}

const RiskObjectContextMenu = (props: RiskObjectContextMenuProps): React.ReactElement => {
  const { checkedRiskObjectRows, dispatchOperation } = props;

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyRiskObjectProps: RiskPropertiesModalProps = { mode, riskObject: checkedRiskObjectRows[0].risk, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RiskPropertiesModal {...modifyRiskObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={() => onClickDelete(checkedRiskObjectRows, dispatchOperation)} disabled={checkedRiskObjectRows.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedRiskObjectRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RiskObjectContextMenu;
