import { PropertiesModalMode } from "components/Modals/ModalParts";
import {
  orderCreateWellJob,
  orderModifyWellJob
} from "components/Modals/PropertiesModal/orderPropertyJobHelpers";
import { getWellProperties } from "components/Modals/PropertiesModal/Properties/WellProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetWell } from "hooks/query/useGetWell";
import { useOperationState } from "hooks/useOperationState";
import Well from "models/well";

interface WellPropertiesModalProps {
  well: Well;
  mode: PropertiesModalMode;
}

export const WellPropertiesModal = (
  props: WellPropertiesModalProps
): React.ReactElement => {
  const { well: wellReference, mode } = props;
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useOperationState();
  const shouldFetchFullWell = mode === PropertiesModalMode.Edit;
  const {
    well: fullWell,
    isLoading
  } = // Input well might be partial, so ensure we have the full well data when in edit mode.
    useGetWell(connectedServer, wellReference.uid, {
      enabled: shouldFetchFullWell
    });

  const well = mode === PropertiesModalMode.Edit ? fullWell : wellReference;
  const properties = getWellProperties(mode);

  const propertyModalProps: PropertiesModalProps<Well> = {
    title:
      mode === PropertiesModalMode.Edit
        ? `Edit properties for ${wellReference.name}`
        : "Create new Well",
    object: well,
    properties,
    onSubmit: async (updates) => {
      dispatchOperation({ type: OperationType.HideModal });
      mode === PropertiesModalMode.Edit
        ? orderModifyWellJob(well, updates)
        : orderCreateWellJob(well, updates);
    },
    isLoading: isLoading
  };

  return <PropertiesModal {...propertyModalProps} />;
};
