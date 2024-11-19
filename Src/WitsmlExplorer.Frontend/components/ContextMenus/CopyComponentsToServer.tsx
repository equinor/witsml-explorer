import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { menuItemText } from "components/ContextMenus/ContextMenuUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import CopyRangeModal, {
  CopyRangeModalProps
} from "components/Modals/CopyRangeModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { ComponentType } from "models/componentType";
import LogCurveInfo from "models/logCurveInfo";
import ObjectOnWellbore from "models/objectOnWellbore";
import { Server } from "models/server";
import { copyComponentsToServer } from "./CopyComponentsToServerUtils";

export interface CopyComponentsToServerMenuItemProps {
  componentsToCopy: { uid: string }[] | LogCurveInfo[];
  componentType: ComponentType;
  sourceParent: ObjectOnWellbore;
  withRange?: boolean;
  componentsToPreserve?: { uid: string }[] | LogCurveInfo[];
  disableMenuItem?: boolean;
}

export const CopyComponentsToServerMenuItem = (
  props: CopyComponentsToServerMenuItemProps
): React.ReactElement => {
  const {
    componentsToCopy,
    componentType,
    withRange,
    componentsToPreserve,
    sourceParent,
    disableMenuItem
  } = props;
  const { connectedServer } = useConnectedServer();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { dispatchOperation } = useOperationState();
  const menuComponents = menuItemText("copy", componentType, componentsToCopy);
  const menuText =
    withRange === true
      ? menuComponents + " with range to server"
      : menuComponents + " to server";

  const onClickHandler = (server: Server) => {
    if (withRange === true) {
      const copyRangeModalProps: CopyRangeModalProps = {
        logObject: sourceParent,
        mnemonics: [],
        infoMessage:
          "This will replace all data in your selected range on the target with data from the source. Data outside this range will be preserved on target.",
        onSubmit(startIndex, endIndex) {
          copyComponentsToServer({
            targetServer: server,
            sourceServer: connectedServer,
            componentsToCopy,
            dispatchOperation,
            sourceParent,
            componentType: componentType,
            startIndex: startIndex.toString(),
            endIndex: endIndex.toString()
          });
        }
      };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <CopyRangeModal {...copyRangeModalProps} />
      });
    } else {
      copyComponentsToServer({
        targetServer: server,
        sourceServer: connectedServer,
        componentsToCopy,
        dispatchOperation,
        sourceParent,
        componentType,
        componentsToPreserve
      });
    }
  };

  return (
    <NestedMenuItem
      key={"copyComponentToServer"}
      label={menuText}
      disabled={componentsToCopy.length < 1 || disableMenuItem}
    >
      {filteredServers?.map(
        (server: Server) =>
          server.id !== connectedServer?.id && (
            <MenuItem
              key={server.name}
              onClick={() => {
                onClickHandler(server);
              }}
              disabled={componentsToCopy.length < 1 || disableMenuItem}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          )
      )}
    </NestedMenuItem>
  );
};
