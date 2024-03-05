import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
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
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { useGetServers } from "hooks/query/useGetServers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import React, { useContext } from "react";
import { colors } from "styles/Colors";

const FluidsReportContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { servers } = useGetServers();
  const { dispatchOperation } = useContext(OperationContext);
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
          dispatchOperation,
          queryClient,
          openInQueryView,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default FluidsReportContextMenu;
