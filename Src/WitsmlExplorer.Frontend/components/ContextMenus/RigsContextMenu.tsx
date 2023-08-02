import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { menuItemText, onClickRefresh, StyledIcon } from "./ContextMenuUtils";
import Rig from "../../models/rig";
import RigPropertiesModal, { RigPropertiesModalProps } from "../Modals/RigPropertiesModal";
import { ObjectType } from "../../models/objectType";
import { pasteObjectOnWellbore } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";
import NavigationContext from "../../contexts/navigationContext";
import { Server } from "../../models/server";

export interface RigsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  wellbore: Wellbore;
  servers: Server[];
  setIsLoading?: (arg: boolean) => void;
}

const RigsContextMenu = (props: RigsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, setIsLoading } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const rigReferences = useClipboardReferencesOfType(ObjectType.Rig);

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
        setIsLoading ? (
          <MenuItem key={"refresh"} onClick={() => onClickRefresh(dispatchOperation, dispatchNavigation, wellbore.wellUid, wellbore.uid, ObjectType.Rig, setIsLoading)}>
            <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
            <Typography color={"primary"}>{`Refresh Rigs`}</Typography>
          </MenuItem>
        ) : null,
        <MenuItem key={"newRig"} onClick={onClickNewRig}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Rig</Typography>
        </MenuItem>,
        <MenuItem key={"pasteRig"} onClick={() => pasteObjectOnWellbore(servers, rigReferences, dispatchOperation, wellbore)} disabled={rigReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "rig", rigReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default RigsContextMenu;
