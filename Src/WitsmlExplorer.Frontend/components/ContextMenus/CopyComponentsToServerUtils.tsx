import { Fragment } from "react";
import {
  DispatchOperation,
  DisplayModalAction
} from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType, getParentType } from "../../models/componentType";
import ComponentReferences, {
  createComponentReferences
} from "../../models/jobs/componentReferences";
import { CopyComponentsJob } from "../../models/jobs/copyJobs";
import { DeleteComponentsJob } from "../../models/jobs/deleteJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { ReplaceComponentsJob } from "../../models/jobs/replaceComponentsJob";
import LogCurveInfo from "../../models/logCurveInfo";
import ObjectOnWellbore, {
  toObjectReference
} from "../../models/objectOnWellbore";
import { Server } from "../../models/server";
import AuthorizationService from "../../services/authorizationService";
import ComponentService from "../../services/componentService";
import JobService, { JobType } from "../../services/jobService";
import ObjectService from "../../services/objectService";
import CopyMnemonicsModal, {
  CopyMnemonicsModalProps
} from "../Modals/CopyMnemonicsModal";
import { displayMissingObjectModal } from "../Modals/MissingObjectModals";
import { displayReplaceModal } from "../Modals/ReplaceModal";
import { pluralize } from "./ContextMenuUtils";
import { getTargetWellboreID } from "./UidMappingUtils.tsx";

export interface OnClickCopyComponentToServerProps {
  targetServer: Server;
  sourceServer: Server;
  componentsToCopy: { uid: string }[] | LogCurveInfo[];
  dispatchOperation: DispatchOperation;
  sourceParent: ObjectOnWellbore;
  componentType: ComponentType;
  startIndex?: string;
  endIndex?: string;
  componentsToPreserve?: { uid: string }[] | LogCurveInfo[]; // These components will not be deleted if they exist on the target server
}

export const copyComponentsToServer = async (
  props: OnClickCopyComponentToServerProps
) => {
  const {
    targetServer,
    sourceServer,
    componentsToCopy,
    dispatchOperation,
    sourceParent,
    componentType,
    startIndex,
    endIndex,
    componentsToPreserve
  } = props;

  dispatchOperation({ type: OperationType.HideContextMenu });

  const { targetWellId, targetWellboreId } = await getTargetWellboreID({
    sourceServerId: sourceServer.id,
    sourceWellId: sourceParent.wellUid,
    sourceWellboreId: sourceParent.wellboreUid,
    targetServerId: targetServer.id
  });

  const wellUid = targetWellId;
  const wellboreUid = targetWellboreId;
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
  const targetParent = await ObjectService.getObject(
    wellUid,
    wellboreUid,
    parentUid,
    parentType,
    null,
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

  if (componentType == ComponentType.Mnemonic) {
    const copyMnemonicsModalProps: CopyMnemonicsModalProps = {
      sourceReferences: sourceComponentReferences,
      targetReference: targetParentReference,
      startIndex: startIndex,
      endIndex: endIndex,
      targetServer: targetServer,
      sourceServer: sourceServer
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <CopyMnemonicsModal {...copyMnemonicsModalProps} />
    };
    dispatchOperation(action);
    return;
  }

  const copyJob: CopyComponentsJob = createCopyJob();

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

  const componentsToDelete = existingTargetComponents.filter(
    (component) =>
      !componentsToPreserve?.find(
        (componentToPreserve) => getId(componentToPreserve) === getId(component)
      )
  );

  if (componentsToDelete.length > 0 && startIndex === undefined) {
    replaceComponents();
  } else {
    AuthorizationService.setSourceServer(sourceServer);
    JobService.orderJobAtServer(
      startIndex !== undefined ? JobType.CopyLogData : JobType.CopyComponents,
      copyJob,
      targetServer,
      sourceServer
    );
  }

  function createCopyJob(): CopyComponentsJob {
    let copyJob: CopyComponentsJob;
    startIndex !== undefined
      ? (copyJob = {
          source: sourceComponentReferences,
          target: targetParentReference,
          startIndex: startIndex,
          endIndex: endIndex
        })
      : (copyJob = {
          source: sourceComponentReferences,
          target: targetParentReference
        });
    return copyJob;
  }

  function replaceComponents() {
    const onConfirm = async () => {
      dispatchOperation({ type: OperationType.HideModal });
      const deleteJob: DeleteComponentsJob = {
        toDelete: createComponentReferences(
          componentsToDelete.map((component) => getId(component)),
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
