import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ObjectType } from "../../models/objectType";
import RiskObject from "../../models/riskObject";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import RiskPropertiesModal, { RiskPropertiesModalProps } from "../Modals/RiskPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";

const RiskObjectContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyRiskObjectProps: RiskPropertiesModalProps = { mode, riskObject: checkedObjects[0] as RiskObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <RiskPropertiesModal {...modifyRiskObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(checkedObjects, ObjectType.Risk, navigationState, dispatchOperation, openInQueryView, wellbore),
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RiskObjectContextMenu;
