import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import WbGeometry from "../../models/wbGeometry";
import WbGeometrySection from "../../models/wbGeometrySection";
import { colors } from "../../styles/Colors";
import WbGeometrySectionPropertiesModal from "../Modals/WbGeometrySectionPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";

export interface WbGeometrySectionContextMenuProps {
  checkedWbGeometrySections: WbGeometrySection[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wbGeometry: WbGeometry;
}

const WbGeometrySectionContextMenu = (props: WbGeometrySectionContextMenuProps): React.ReactElement => {
  const { checkedWbGeometrySections, dispatchOperation, wbGeometry } = props;

  const onClickProperties = async () => {
    const wbGeometrySectionPropertiesModalProps = { wbGeometrySection: checkedWbGeometrySections[0], wbGeometry, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WbGeometrySectionPropertiesModal {...wbGeometrySectionPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedWbGeometrySections.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WbGeometrySectionContextMenu;
