import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/ObjectOnWellboreProperties";
import { getWellboreProperties } from "components/Modals/PropertiesModal/Properties/WellboreProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import { WellPropertiesModal } from "components/Modals/PropertiesModal/WellPropertiesModal";
import {
  orderCreateObjectOnWellboreJob,
  orderCreateWellboreJob,
  orderModifyObjectOnWellboreJob,
  orderModifyWellboreJob
} from "components/Modals/PropertiesModal/orderPropertyJobHelpers";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import LogObject from "models/logObject";
import { ObjectType, ObjectTypeToModel } from "models/objectType";
import Well from "models/well";
import Wellbore from "models/wellbore";

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
        ? orderModifyObjectOnWellboreJob(objectType, object, updates)
        : orderCreateObjectOnWellboreJob(objectType, object, updates);
    }
  };
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: <PropertiesModal {...propertyModalProps} />
  });
};

export const openWellProperties = async (
  well: Well,
  dispatchOperation: DispatchOperation,
  mode: PropertiesModalMode = PropertiesModalMode.Edit
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });

  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: <WellPropertiesModal well={well} mode={mode} />
  });
};

export const openWellboreProperties = async (
  wellbore: Wellbore,
  dispatchOperation: DispatchOperation,
  mode: PropertiesModalMode = PropertiesModalMode.Edit
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const properties = getWellboreProperties(mode);

  const propertyModalProps: PropertiesModalProps<Wellbore> = {
    title:
      mode === PropertiesModalMode.Edit
        ? `Edit properties for ${wellbore.name}`
        : "Create new Wellbore",
    object: wellbore,
    properties,
    onSubmit: async (updates) => {
      dispatchOperation({ type: OperationType.HideModal });
      mode === PropertiesModalMode.Edit
        ? orderModifyWellboreJob(wellbore, updates)
        : orderCreateWellboreJob(wellbore, updates);
    }
  };
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: <PropertiesModal {...propertyModalProps} />
  });
};
