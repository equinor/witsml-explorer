import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/ObjectOnWellboreProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import { ObjectType, ObjectTypeToModel } from "models/objectType";
import JobService, { JobType } from "services/jobService";

export const openObjectOnWellboreProperties = async <T extends ObjectType>(
  objectType: T,
  object: ObjectTypeToModel[T],
  dispatchOperation: DispatchOperation,
  mode: PropertiesModalMode = PropertiesModalMode.Edit
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const indexType =
    objectType === ObjectType.Log ? (object as LogObject).indexType : null;
  const properties = getObjectOnWellboreProperties(objectType, mode, indexType);

  const propertyModalProps: PropertiesModalProps<ObjectTypeToModel[T]> = {
    title:
      mode === PropertiesModalMode.Edit
        ? `Edit properties for ${object.name}`
        : `Create new ${objectType}`,
    object,
    properties,
    onSubmit: async (updates) => {
      dispatchOperation({ type: OperationType.HideModal });
      mode === PropertiesModalMode.Edit
        ? orderModifyJob(objectType, object, updates)
        : orderCreateJob(objectType, object, updates);
    }
  };
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: <PropertiesModal {...propertyModalProps} />
  });
};

const orderModifyJob = async <T extends ObjectType>(
  objectType: T,
  object: ObjectTypeToModel[T],
  updates: Partial<ObjectTypeToModel[T]>
) => {
  const modifyJob = {
    object: {
      // updates only contains modified properties, so we need to add uids for a correct reference to the object.
      uid: object.uid,
      wellUid: object.wellUid,
      wellboreUid: object.wellboreUid,
      ...updates,
      objectType: objectType
    },
    objectType: objectType
  };
  await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
};

const orderCreateJob = async <T extends ObjectType>(
  objectType: T,
  object: ObjectTypeToModel[T],
  updates: Partial<ObjectTypeToModel[T]>
) => {
  const createJob = {
    object: {
      ...object,
      ...updates,
      objectType: objectType
    },
    objectType: objectType
  };
  await JobService.orderJob(JobType.CreateObjectOnWellbore, createJob);
};
