import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText
} from "components/ContextMenus/ContextMenuUtils";
import { pasteComponents } from "components/ContextMenus/CopyUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import { openObjectOnWellboreProperties } from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetServers } from "hooks/query/useGetServers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { ComponentType } from "models/componentType";
import MudLog from "models/mudLog";
import { ObjectType } from "models/objectType";
import React from "react";
import { colors } from "styles/Colors";

const MudLogContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const geologyIntervalReferences = useClipboardComponentReferencesOfType(
    ComponentType.GeologyInterval
  );
  const { dispatchOperation } = useOperationState();
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"paste"}
        onClick={() =>
          pasteComponents(
            servers,
            geologyIntervalReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={
          geologyIntervalReferences === null || checkedObjects.length !== 1
        }
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText(
            "paste",
            "geology interval",
            geologyIntervalReferences?.componentUids
          )}
        </Typography>
      </MenuItem>,
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={() =>
          openObjectOnWellboreProperties(
            ObjectType.MudLog,
            checkedObjects?.[0] as MudLog,
            dispatchOperation
          )
        }
        disabled={checkedObjects.length !== 1}
      >
        <StyledIcon name="settings" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>Properties</Typography>
      </MenuItem>
    ];
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.MudLog,
          connectedServer,
          servers,
          filteredServers,
          dispatchOperation,
          queryClient,
          openInQueryView,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default MudLogContextMenu;
