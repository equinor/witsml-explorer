import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/ObjectOnWellboreProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import {
  orderCreateObjectOnWellboreJob,
  orderModifyObjectOnWellboreJob
} from "components/Modals/PropertiesModal/orderPropertyJobHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObject } from "hooks/query/useGetObject";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import { ObjectType, ObjectTypeToModel } from "models/objectType";

interface ObjectOnWellborePropertiesModalProps<T extends ObjectType> {
  objectType: T;
  object: ObjectTypeToModel[T];
  mode: PropertiesModalMode;
}

export const ObjectOnWellborePropertiesModal = <T extends ObjectType>(
  props: ObjectOnWellborePropertiesModalProps<T>
): React.ReactElement => {
  const { objectType, object: objectReference, mode } = props;
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useOperationState();
  const shouldFetchFullObject = mode === PropertiesModalMode.Edit;
  const { object: fullObject, isLoading } = useGetObject(
    connectedServer,
    objectReference.wellUid,
    objectReference.wellboreUid,
    objectType,
    objectReference.uid,
    {
      enabled: shouldFetchFullObject
    }
  );

  const object =
    mode === PropertiesModalMode.Edit ? fullObject : objectReference;
  const indexType =
    objectType === ObjectType.Log
      ? (objectReference as LogObject).indexType
      : null;
  const properties = getObjectOnWellboreProperties(objectType, mode, indexType);

  const propertyModalProps: PropertiesModalProps<ObjectTypeToModel[T]> = {
    title:
      mode === PropertiesModalMode.Edit
        ? `Edit properties for ${objectReference.name}`
        : `Create new ${objectType}`,
    object: object,
    properties,
    onSubmit: async (updates) => {
      dispatchOperation({ type: OperationType.HideModal });
      mode === PropertiesModalMode.Edit
        ? orderModifyObjectOnWellboreJob(objectType, object, updates)
        : orderCreateObjectOnWellboreJob(objectType, object, updates);
    },
    isLoading: isLoading
  };

  return <PropertiesModal {...propertyModalProps} />;
};
