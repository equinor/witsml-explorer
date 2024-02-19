import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useContext } from "react";
import { useConnectedServer } from "../../contexts/connectedServerContext";
import OperationContext from "../../contexts/operationContext";
import { useGetServers } from "../../hooks/query/useGetServers";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import { ComponentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteComponents } from "./CopyUtils";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

const FluidsReportContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
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
          wellbore,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default FluidsReportContextMenu;
