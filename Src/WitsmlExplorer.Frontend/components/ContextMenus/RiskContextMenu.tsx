import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { RiskObjectRow } from "../ContentViews/RisksListView";
import { PropertiesModalMode } from "../Modals/ModalParts";
import RiskPropertiesModal, { RiskPropertiesModalProps } from "../Modals/RiskPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import { onClickCopy, onClickDelete, orderCopyJob, useClipboardRiskReferences } from "./RiskContextMenuUtils";

export interface RiskObjectContextMenuProps {
  checkedRiskObjectRows: RiskObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  selectedServer: Server;
  wellbore: Wellbore;
  servers: Server[];
}

const RiskObjectContextMenu = (props: RiskObjectContextMenuProps): React.ReactElement => {
  const { checkedRiskObjectRows, dispatchOperation, selectedServer, wellbore, servers } = props;
  const [riskReferences] = useClipboardRiskReferences();
  const risks = checkedRiskObjectRows.map((row) => row.risk);

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyRiskObjectProps: RiskPropertiesModalProps = { mode, riskObject: checkedRiskObjectRows[0].risk, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RiskPropertiesModal {...modifyRiskObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => onClickCopy(selectedServer, risks, dispatchOperation)} disabled={risks.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy risk{risks?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() => onClickPaste(servers, riskReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, riskReferences, dispatchOperation))}
          disabled={riskReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste risk{riskReferences?.riskUids.length > 1 && "s"}</Typography>
        </MenuItem>,
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
