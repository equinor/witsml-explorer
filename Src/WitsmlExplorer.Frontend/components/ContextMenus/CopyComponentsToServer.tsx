import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { ComponentType } from "../../models/componentType";
import { Server } from "../../models/server";
import { menuItemText } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";
import { copyComponentsToServer } from "./CopyComponentsToServerUtils";
import CopyRangeModal, { CopyRangeModalProps } from "../Modals/CopyRangeModal";
import OperationType from "../../contexts/operationType";

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
                if (withRange === true) {
                  const copyRangeModalProps: CopyRangeModalProps = {
                    mnemonics: [],
                    onSubmit(startIndex, endIndex) {
                      const componentsToCopyWithRange =
                        componentsToCopy as ComponentWithRange[];
                      const componentsRange = componentsToCopyWithRange.filter(
                        (x) =>
                          x.minIndex >= startIndex && x.maxIndex <= endIndex
                      );
                      copyComponentsToServer({
                        targetServer: server,
                        sourceServer: selectedServer,
                        componentsToCopy: componentsRange,
                        dispatchOperation,
                        sourceParent: selectedObject,
                        componentType: componentType
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
