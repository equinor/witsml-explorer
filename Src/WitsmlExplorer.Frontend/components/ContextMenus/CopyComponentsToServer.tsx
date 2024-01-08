import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import {
  menuItemText,
  pluralize
} from "components/ContextMenus/ContextMenuUtils";
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

export interface CopyComponentsToServerMenuItemProps {
  componentsToCopy: { uid: string }[];
  componentType: ComponentType;
}

export const CopyComponentsToServerMenuItem = (
  props: CopyComponentsToServerMenuItemProps
): React.ReactElement => {
  const { componentsToCopy, componentType } = props;
  const {
    navigationState: { selectedServer, selectedObject, servers }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  return (
    <NestedMenuItem
      key={"copyComponentToServer"}
      label={`${menuItemText(
        "copy",
        componentType,
        componentsToCopy
      )} to server`}
      disabled={componentsToCopy.length < 1}
    >
      {servers.map(
        (server: Server) =>
          server.id !== selectedServer.id && (
            <MenuItem
              key={server.name}
              onClick={() =>
                copyComponentsToServer({
                  targetServer: server,
                  sourceServer: selectedServer,
                  componentsToCopy,
                  dispatchOperation,
                  sourceParent: selectedObject,
                  componentType
                })
              }
              disabled={componentsToCopy.length < 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          )
      )}
    </NestedMenuItem>
  );
};

export interface OnClickCopyComponentToServerProps {
  targetServer: Server;
  sourceServer: Server;
  componentsToCopy: { uid: string }[] | LogCurveInfo[];
  dispatchOperation: DispatchOperation;
  sourceParent: ObjectOnWellbore;
  componentType: ComponentType;
}

const copyComponentsToServer = async (
  props: OnClickCopyComponentToServerProps
) => {
  const {
    targetServer,
    sourceServer,
    componentsToCopy,
    dispatchOperation,
    sourceParent,
    componentType
  } = props;
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = sourceParent.wellUid;
  const wellboreUid = sourceParent.wellboreUid;
  const parentUid = sourceParent.uid;
  const parentType = getParentType(componentType);
  const getId =
    componentType == ComponentType.Mnemonic
      ? (component: any) => {
          return component.mnemonic;
        }
      : (component: any) => {
          return component.uid;
        };

  const targetParent = await ObjectService.getObjectFromServer(
    wellUid,
    wellboreUid,
    parentUid,
    parentType,
    targetServer
  );
  if (targetParent?.uid !== parentUid) {
    displayMissingObjectModal(
      targetServer,
      wellUid,
      wellboreUid,
      parentUid,
      dispatchOperation,
      `No ${pluralize(componentType)} will be copied.`,
      parentType
    );
    return;
  }
  const sourceComponentReferences: ComponentReferences =
    createComponentReferences(
      componentsToCopy.map((component) => getId(component)),
      sourceParent,
      componentType,
      sourceServer.url
    );
  const targetParentReference: ObjectReference =
    toObjectReference(targetParent);
  const copyJob: CopyComponentsJob = {
    source: sourceComponentReferences,
    target: targetParentReference
  };

  const allTargetComponents = await ComponentService.getComponents(
    wellUid,
    wellboreUid,
    parentUid,
    componentType,
    targetServer
  );
  const existingTargetComponents = allTargetComponents.filter((component) =>
    componentsToCopy.find(
      (componentToCopy) => getId(componentToCopy) === getId(component)
    )
  );
  if (existingTargetComponents.length > 0) {
    const onConfirm = async () => {
      dispatchOperation({ type: OperationType.HideModal });
      const deleteJob: DeleteComponentsJob = {
        toDelete: createComponentReferences(
          existingTargetComponents.map((component) => getId(component)),
          targetParent,
          componentType
        )
      };
      const replaceJob: ReplaceComponentsJob = { deleteJob, copyJob };
      await JobService.orderJobAtServer(
        JobType.ReplaceComponents,
        replaceJob,
        targetServer,
        sourceServer
      );
    };
    const print =
      componentType == ComponentType.Mnemonic ? printCurveInfo : printUid;
    displayReplaceModal(
      existingTargetComponents,
      componentsToCopy,
      componentType,
      parentType,
      dispatchOperation,
      onConfirm,
      print
    );
  } else {
    AuthorizationService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(
      JobType.CopyComponents,
      copyJob,
      targetServer,
      sourceServer
    );
  }
};

function printUid(component: { uid: string }): JSX.Element {
  return (
    <Fragment key={component.uid}>
      <br />
      Uid: {component.uid}
    </Fragment>
  );
}

function printCurveInfo(curve: LogCurveInfo): JSX.Element {
  const isDepthIndex = !!curve.maxDepthIndex;
  return (
    <Fragment key={curve.mnemonic}>
      <br />
      Mnemonic: {curve.mnemonic}
      <br />
      Start index: {isDepthIndex ? curve.minDepthIndex : curve.minDateTimeIndex}
      <br />
      End index: {isDepthIndex ? curve.maxDepthIndex : curve.maxDateTimeIndex}
    </Fragment>
  );
}
