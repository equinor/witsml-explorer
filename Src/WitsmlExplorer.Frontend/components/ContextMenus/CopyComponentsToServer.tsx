import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import {
  menuItemText,
  pluralize
} from "components/ContextMenus/ContextMenuUtils";
import { useContext } from "react";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { displayMissingObjectModal } from "components/Modals/MissingObjectModals";
import { displayReplaceModal } from "components/Modals/ReplaceModal";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ComponentType, getParentType } from "models/componentType";
import ComponentReferences, {
  createComponentReferences
} from "models/jobs/componentReferences";
import { CopyComponentsJob } from "models/jobs/copyJobs";
import { DeleteComponentsJob } from "models/jobs/deleteJobs";
import ObjectReference from "models/jobs/objectReference";
import { ReplaceComponentsJob } from "models/jobs/replaceComponentsJob";
import LogCurveInfo from "models/logCurveInfo";
import ObjectOnWellbore, { toObjectReference } from "models/objectOnWellbore";
import { Server } from "models/server";
import { Fragment, useContext } from "react";
import AuthorizationService from "services/authorizationService";
import ComponentService from "services/componentService";
import JobService, { JobType } from "services/jobService";
import ObjectService from "services/objectService";
import { copyComponentsToServer } from "./CopyComponentsToServerUtils";
import CopyRangeModal, { CopyRangeModalProps } from "components/Modals/CopyRangeModal";

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
