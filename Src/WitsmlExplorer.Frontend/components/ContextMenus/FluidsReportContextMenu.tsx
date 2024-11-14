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
import FluidsReport from "models/fluidsReport";
import { ObjectType } from "models/objectType";
import React from "react";
import { colors } from "styles/Colors";

const FluidsReportContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { dispatchOperation } = useOperationState();
  const openInQueryView = useOpenInQueryView();
  const fluidReferences = useClipboardComponentReferencesOfType(
    ComponentType.Fluid
  );
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"pasteComponent"}
        onClick={() =>
          pasteComponents(
            servers,
            fluidReferences,
            dispatchOperation,
            checkedObjects[0]
          )
        }
        disabled={fluidReferences === null || checkedObjects.length !== 1}
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText("paste", "fluid", fluidReferences?.componentUids)}
        </Typography>
      </MenuItem>
    ];
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.FluidsReport,
          connectedServer,
          servers,
          filteredServers,
          dispatchOperation,
          queryClient,
          openInQueryView,
          extraMenuItems()
        ),
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={() =>
            openObjectOnWellboreProperties(
              ObjectType.FluidsReport,
              checkedObjects?.[0] as FluidsReport,
              dispatchOperation
            )
          }
          disabled={checkedObjects.length !== 1}
        >
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default FluidsReportContextMenu;
