import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import { openObjectOnWellboreProperties } from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetServers } from "hooks/query/useGetServers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import DataWorkOrder from "models/dataWorkOrder/dataWorkOrder";
import { ObjectType } from "models/objectType";
import React from "react";
import { colors } from "styles/Colors";

const DataWorkOrderContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { dispatchOperation } = useOperationState();
  const openInQueryView = useOpenInQueryView();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.DataWorkOrder,
          connectedServer,
          servers,
          filteredServers,
          dispatchOperation,
          queryClient,
          openInQueryView,
          []
        ),
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={() =>
            openObjectOnWellboreProperties(
              ObjectType.DataWorkOrder,
              checkedObjects?.[0] as DataWorkOrder,
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

export default DataWorkOrderContextMenu;
