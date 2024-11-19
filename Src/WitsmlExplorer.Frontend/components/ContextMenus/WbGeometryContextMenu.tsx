import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
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
import { ObjectType } from "models/objectType";
import WbGeometryObject from "models/wbGeometry";
import React from "react";
import { colors } from "styles/Colors";

const WbGeometryObjectContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { dispatchOperation } = useOperationState();
  const wbGeometrySectionReferences = useClipboardComponentReferencesOfType(
    ComponentType.WbGeometrySection
  );
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
            wbGeometrySectionReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={
          wbGeometrySectionReferences === null || checkedObjects.length !== 1
        }
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText(
            "paste",
            "wbGeometry section",
            wbGeometrySectionReferences?.componentUids
          )}
        </Typography>
      </MenuItem>,
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={() =>
          openObjectOnWellboreProperties(
            ObjectType.WbGeometry,
            checkedObjects?.[0] as WbGeometryObject,
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
          ObjectType.WbGeometry,
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

export default WbGeometryObjectContextMenu;
