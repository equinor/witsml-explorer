import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import { DisplayModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ObjectType } from "../../models/objectType";
import Rig from "../../models/rig";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { StoreFunction, TemplateObjects } from "../ContentViews/QueryViewUtils";
import { PropertiesModalMode } from "../Modals/ModalParts";
import RigPropertiesModal, {
  RigPropertiesModalProps
} from "../Modals/RigPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickRefresh } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface RigsContextMenuProps {
  wellbore: Wellbore;
  servers: Server[];
}

const RigsContextMenu = (props: RigsContextMenuProps): React.ReactElement => {
  const { wellbore, servers } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const rigReferences = useClipboardReferencesOfType(ObjectType.Rig);
  const openInQueryView = useOpenInQueryView();
  const { authorizationState } = useAuthorizationState();
  const queryClient = useQueryClient();

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
    const rigPropertiesModalProps: RigPropertiesModalProps = {
      mode: PropertiesModalMode.New,
      rig: newRig,
      dispatchOperation
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <RigPropertiesModal {...rigPropertiesModalProps} />
    };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() =>
            onClickRefresh(
              dispatchOperation,
              queryClient,
              authorizationState?.server?.url,
              wellbore.wellUid,
              wellbore.uid,
              ObjectType.Rig
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>{`Refresh Rigs`}</Typography>
        </MenuItem>,
        <MenuItem key={"newRig"} onClick={onClickNewRig}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Rig</Typography>
        </MenuItem>,
        <MenuItem
          key={"pasteRig"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              rigReferences,
              dispatchOperation,
              wellbore
            )
          }
          disabled={rigReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", "rig", rigReferences?.objectUids)}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Rig,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: wellbore.uid,
                  objectUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Rig</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default RigsContextMenu;
