import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText
} from "components/ContextMenus/ContextMenuUtils";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import MessageComparisonModal, {
  MessageComparisonModalProps
} from "components/Modals/MessageComparisonModal";
import ObjectPickerModal, {
  ObjectPickerProps
} from "components/Modals/ObjectPickerModal";
import { openObjectOnWellboreProperties } from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import MessageObject from "models/messageObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import React from "react";
import { colors } from "styles/Colors";

const MessageObjectContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { dispatchOperation } = useOperationState();
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);

  const onClickCompare = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const onPicked = (targetObject: ObjectOnWellbore, targetServer: Server) => {
      const props: MessageComparisonModalProps = {
        sourceMessage: checkedObjects[0] as MessageObject,
        sourceServer: connectedServer,
        targetServer,
        targetObject,
        dispatchOperation
      };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <MessageComparisonModal {...props} />
      });
    };
    const props: ObjectPickerProps = {
      sourceObject: checkedObjects[0],
      objectType: ObjectType.Message,
      onPicked
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ObjectPickerModal {...props} />
    });
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"compare"}
        onClick={onClickCompare}
        disabled={checkedObjects.length !== 1}
      >
        <StyledIcon name="compare" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>{`${menuItemText(
          "Compare",
          "message",
          []
        )}`}</Typography>
      </MenuItem>,
      <Divider key={"divider"} />,
      <MenuItem
        key={"properties"}
        onClick={() =>
          openObjectOnWellboreProperties(
            ObjectType.Message,
            checkedObjects?.[0] as MessageObject,
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
          ObjectType.Message,
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

export default MessageObjectContextMenu;
