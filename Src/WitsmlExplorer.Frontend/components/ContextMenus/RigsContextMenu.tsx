import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import {
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh
} from "components/ContextMenus/ContextMenuUtils";
import { pasteObjectOnWellbore } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import RigPropertiesModal, {
  RigPropertiesModalProps
} from "components/Modals/RigPropertiesModal";
import NavigationContext from "contexts/navigationContext";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface RigsContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideModalAction | HideContextMenuAction
  ) => void;
  wellbore: Wellbore;
  servers: Server[];
  setIsLoading?: (arg: boolean) => void;
}

const RigsContextMenu = (props: RigsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, setIsLoading } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const rigReferences = useClipboardReferencesOfType(ObjectType.Rig);
  const openInQueryView = useOpenInQueryView();

  const onClickNewRig = () => {
    const newRig: Rig = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      airGap: null,
      approvals: null,
      commonData: null,
      classRig: null,
      dTimEndOp: null,
      dTimStartOp: null,
      emailAddress: null,
      faxNumber: null,
      manufacturer: null,
      nameContact: null,
      owner: null,
      ratingDrillDepth: null,
      ratingWaterDepth: null,
      registration: null,
      telNumber: null,
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
        setIsLoading ? (
          <MenuItem
            key={"refresh"}
            onClick={() =>
              onClickRefresh(
                dispatchOperation,
                dispatchNavigation,
                wellbore.wellUid,
                wellbore.uid,
                ObjectType.Rig,
                setIsLoading
              )
            }
          >
            <StyledIcon
              name="refresh"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>{`Refresh Rigs`}</Typography>
          </MenuItem>
        ) : null,
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
