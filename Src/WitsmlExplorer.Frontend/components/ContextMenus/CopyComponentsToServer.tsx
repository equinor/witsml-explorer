import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { menuItemText } from "components/ContextMenus/ContextMenuUtils";
import { useContext } from "react";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import { Server } from "models/server";
import { copyComponentsToServer } from "./CopyComponentsToServerUtils";
import CopyRangeModal, {
  CopyRangeModalProps
} from "components/Modals/CopyRangeModal";

export interface CopyComponentsToServerMenuItemProps {
  componentsToCopy: { uid: string }[];
  componentType: ComponentType;
  withRange?: boolean;
}

interface ComponentWithRange {
  uid: string;
  minIndex: number | Date;
  maxIndex: number | Date;
}

export const CopyComponentsToServerMenuItem = (
  props: CopyComponentsToServerMenuItemProps
): React.ReactElement => {
  const { componentsToCopy, componentType, withRange } = props;
  const {
    navigationState: { selectedServer, selectedObject, servers }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const menuComponents = menuItemText("copy", componentType, componentsToCopy);
  const menuText =
    withRange === true
      ? menuComponents + " with range to server"
      : menuComponents + " to server";

  const onClickHandler = (server: Server) => {
    if (withRange === true) {
      const copyRangeModalProps: CopyRangeModalProps = {
        mnemonics: [],
        infoMessage:
          "This will replace all data in your selected range on the target with data from the source. Data outside this range will be preserved on target.",
        onSubmit(startIndex, endIndex) {
          const componentsToCopyWithRange =
            componentsToCopy as ComponentWithRange[];
          const componentsRange = componentsToCopyWithRange.filter(
            (x) => x.minIndex <= endIndex && x.maxIndex >= startIndex
          );
          copyComponentsToServer({
            targetServer: server,
            sourceServer: selectedServer,
            componentsToCopy: componentsRange,
            dispatchOperation,
            sourceParent: selectedObject,
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
        sourceServer: selectedServer,
        componentsToCopy,
        dispatchOperation,
        sourceParent: selectedObject,
        componentType
      });
    }
  };

  return (
    <NestedMenuItem
      key={"copyComponentToServer"}
      label={menuText}
      disabled={componentsToCopy.length < 1}
    >
      {servers.map(
        (server: Server) =>
          server.id !== selectedServer.id && (
            <MenuItem
              key={server.name}
              onClick={() => {
                onClickHandler(server);
              }}
              disabled={componentsToCopy.length < 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          )
      )}
    </NestedMenuItem>
  );
};
