import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { Fragment, useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType, getParentType } from "../../models/componentType";
import ComponentReferences, { createComponentReferences } from "../../models/jobs/componentReferences";
import { CopyComponentsJob } from "../../models/jobs/copyJobs";
import { DeleteComponentsJob } from "../../models/jobs/deleteJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { ReplaceComponentsJob } from "../../models/jobs/replaceComponentsJob";
import LogCurveInfo from "../../models/logCurveInfo";
import ObjectOnWellbore, { toObjectReference } from "../../models/objectOnWellbore";
import { Server } from "../../models/server";
import AuthorizationService from "../../services/authorizationService";
import ComponentService from "../../services/componentService";
import JobService, { JobType } from "../../services/jobService";
import ObjectService from "../../services/objectService";
import { displayMissingObjectModal } from "../Modals/MissingObjectModals";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { DispatchOperation, menuItemText, pluralize } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface CopyComponentsToServerMenuItemProps {
  componentsToCopy: { uid: string }[];
  componentType: ComponentType;
}

export const CopyComponentsToServerMenuItem = (props: CopyComponentsToServerMenuItemProps): React.ReactElement => {
  const { componentsToCopy, componentType } = props;
  const {
    navigationState: { selectedServer, selectedObject, servers }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);

  return (
    <NestedMenuItem key={"copyComponentToServer"} label={`${menuItemText("copy", componentType, componentsToCopy)} to server`} disabled={componentsToCopy.length < 1}>
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
  componentsToCopy: { uid: string }[];
  dispatchOperation: DispatchOperation;
  sourceParent: ObjectOnWellbore;
  componentType: ComponentType;
}

const copyComponentsToServer = async (props: OnClickCopyComponentToServerProps) => {
  const { targetServer, sourceServer, componentsToCopy, dispatchOperation, sourceParent, componentType } = props;
  dispatchOperation({ type: OperationType.HideContextMenu });
  const wellUid = sourceParent.wellUid;
  const wellboreUid = sourceParent.wellboreUid;
  const parentUid = sourceParent.uid;
  const parentType = getParentType(componentType);

  const targetParent = await ObjectService.getObjectFromServer(wellUid, wellboreUid, parentUid, parentType, targetServer);
  if (targetParent?.uid !== parentUid) {
    displayMissingObjectModal(targetServer, wellUid, wellboreUid, parentUid, dispatchOperation, `No ${pluralize(componentType)} will be copied.`, parentType);
    return;
  }

  const sourceComponentReferences: ComponentReferences = createComponentReferences(
    componentsToCopy.map((component) => component.uid),
    sourceParent,
    componentType,
    sourceServer.url
  );
  const targetParentReference: ObjectReference = toObjectReference(targetParent);
  const copyJob: CopyComponentsJob = { source: sourceComponentReferences, target: targetParentReference };

  const allComponents = await ComponentService.getComponents(wellUid, wellboreUid, parentUid, componentType, targetServer);
  const existingComponents = allComponents.filter((component) => componentsToCopy.find((componentToCopy) => componentToCopy.uid === component.uid));
  if (existingComponents.length > 0) {
    const onConfirm = async () => {
      dispatchOperation({ type: OperationType.HideModal });
      const deleteJob: DeleteComponentsJob = {
        toDelete: createComponentReferences(
          existingComponents.map((item) => item.uid),
          targetParent,
          componentType
        )
      };
      const replaceJob: ReplaceComponentsJob = { deleteJob, copyJob };
      await JobService.orderJobAtServer(JobType.ReplaceComponents, replaceJob, targetServer, sourceServer);
    };
    const print = componentType == ComponentType.Mnemonic ? printCurveInfo : printUid;
    displayReplaceModal(existingComponents, componentsToCopy, componentType, parentType, dispatchOperation, onConfirm, print);
  } else {
    AuthorizationService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(JobType.CopyComponents, copyJob, targetServer, sourceServer);
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
