import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { v4 as uuid } from "uuid";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import Rig from "../../models/rig";
import RigPropertiesModal, { RigPropertiesModalProps } from "../Modals/RigPropertiesModal";

export interface RigsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  wellbore: Wellbore;
}

const RigsContextMenu = (props: RigsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore } = props;

  const onClickNewRig = () => {
    const newRig: Rig = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      airGap: null,
      approvals: "",
      commonData: null,
      classRig: "",
      dTimEndOp: "",
      dTimStartOp: "",
      emailAddress: "",
      faxNumber: "",
      manufacturer: "",
      nameContact: "",
      owner: "",
      ratingDrillDepth: null,
      ratingWaterDepth: null,
      registration: "",
      telNumber: "",
      typeRig: "unknown",
      yearEntService: null
    };
    const rigPropertiesModalProps: RigPropertiesModalProps = { mode: PropertiesModalMode.New, rig: newRig, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <RigPropertiesModal {...rigPropertiesModalProps} /> };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"newRig"} onClick={onClickNewRig}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Rig</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RigsContextMenu;
