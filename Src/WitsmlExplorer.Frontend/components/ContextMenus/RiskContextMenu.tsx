import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
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
import { ObjectType } from "models/objectType";
import RiskObject from "models/riskObject";
import React from "react";
import { colors } from "styles/Colors";

const RiskObjectContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { dispatchOperation } = useOperationState();
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={() =>
          openObjectOnWellboreProperties(
            ObjectType.Risk,
            checkedObjects?.[0] as RiskObject,
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
          ObjectType.Risk,
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

export default RiskObjectContextMenu;
