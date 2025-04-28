import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
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
import { openObjectOnWellboreProperties } from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useOperationState } from "hooks/useOperationState";
import { toWellboreReference } from "models/jobs/wellboreReference";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import React from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface RigsContextMenuProps {
  wellbore: Wellbore;
  servers: Server[];
}

const RigsContextMenu = (props: RigsContextMenuProps): React.ReactElement => {
  const { wellbore, servers } = props;
  const { dispatchOperation } = useOperationState();
  const rigReferences = useClipboardReferencesOfType(ObjectType.Rig);
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
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
    openObjectOnWellboreProperties(
      ObjectType.Rig,
      newRig,
      dispatchOperation,
      PropertiesModalMode.New
    );
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
              connectedServer?.url,
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
              toWellboreReference(wellbore),
              connectedServer
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
