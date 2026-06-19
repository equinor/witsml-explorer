import { PropertiesModalMode } from "components/Modals/ModalParts";
import { ObjectOnWellborePropertiesModal } from "components/Modals/PropertiesModal/ObjectOnWellborePropertiesModal";
import { WellPropertiesModal } from "components/Modals/PropertiesModal/WellPropertiesModal";
import { WellborePropertiesModal } from "components/Modals/PropertiesModal/WellborePropertiesModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
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
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: (
      <ObjectOnWellborePropertiesModal
        objectType={objectType}
        object={object}
        mode={mode}
      />
    )
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

  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: <WellborePropertiesModal wellbore={wellbore} mode={mode} />
  });
};
