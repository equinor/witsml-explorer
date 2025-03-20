import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  ObjectTypeToTemplateObject,
  StoreFunction
} from "components/ContentViews/QueryViewUtils";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh,
  onClickShowGroupOnServer,
  pluralize
} from "components/ContextMenus/ContextMenuUtils";
import { pasteObjectOnWellbore } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { openObjectOnWellboreProperties } from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetServers } from "hooks/query/useGetServers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { toWellboreReference } from "models/jobs/wellboreReference";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import React from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface ObjectsSidebarContextMenuProps {
  wellbore: Wellbore;
  objectType: ObjectType;
}

const ObjectsSidebarContextMenu = (
  props: ObjectsSidebarContextMenuProps
): React.ReactElement => {
  const { wellbore, objectType } = props;
  const { dispatchOperation } = useOperationState();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const objectReferences = useClipboardReferencesOfType(objectType);
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const onClickNewObject = () => {
    const newObject: ObjectOnWellbore = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name
    };
    openObjectOnWellboreProperties(
      objectType,
      newObject,
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
              objectType
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>{`Refresh ${pluralize(
            objectType
          )}`}</Typography>
        </MenuItem>,
        <MenuItem key={"newObject"} onClick={onClickNewObject}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New {objectType}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              objectReferences,
              dispatchOperation,
              toWellboreReference(wellbore),
              connectedServer
            )
          }
          disabled={objectReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", objectType, objectReferences?.objectUids)}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {filteredServers
            .filter((server: Server) => server.id != connectedServer.id)
            .map((server: Server) => (
              <MenuItem
                key={server.name}
                onClick={() =>
                  onClickShowGroupOnServer(
                    dispatchOperation,
                    server,
                    connectedServer,
                    wellbore,
                    objectType
                  )
                }
              >
                <Typography color={"primary"}>{server.name}</Typography>
              </MenuItem>
            ))}
        </NestedMenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: ObjectTypeToTemplateObject[objectType],
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
              <Typography color={"primary"}>{`New ${objectType}`}</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default ObjectsSidebarContextMenu;
