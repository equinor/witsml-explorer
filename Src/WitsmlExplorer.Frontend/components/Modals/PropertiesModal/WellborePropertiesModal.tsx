import { PropertiesModalMode } from "components/Modals/ModalParts";
import {
  orderCreateWellboreJob,
  orderModifyWellboreJob
} from "components/Modals/PropertiesModal/orderPropertyJobHelpers";
import { getWellboreProperties } from "components/Modals/PropertiesModal/Properties/WellboreProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetWellbore } from "hooks/query/useGetWellbore";
import { useOperationState } from "hooks/useOperationState";
import Wellbore from "models/wellbore";

interface WellborePropertiesModalProps {
  wellbore: Wellbore;
  mode: PropertiesModalMode;
}

export const WellborePropertiesModal = (
  props: WellborePropertiesModalProps
): React.ReactElement => {
  const { wellbore: wellboreReference, mode } = props;
  const { connectedServer } = useConnectedServer();
  const { dispatchOperation } = useOperationState();
  const shouldFetchFullWellbore = mode === PropertiesModalMode.Edit;
  const { wellbore: fullWellbore, isFetching } = useGetWellbore(
    connectedServer,
    wellboreReference.wellUid,
    wellboreReference.uid,
    {
      enabled: shouldFetchFullWellbore
    }
  );

  const wellbore =
    mode === PropertiesModalMode.Edit ? fullWellbore : wellboreReference;
  const properties = getWellboreProperties(mode);

  const propertyModalProps: PropertiesModalProps<Wellbore> = {
    title:
      mode === PropertiesModalMode.Edit
        ? `Edit properties for ${wellboreReference.name}`
        : "Create new Wellbore",
    object: wellbore,
    properties,
    onSubmit: async (updates) => {
      dispatchOperation({ type: OperationType.HideModal });
      mode === PropertiesModalMode.Edit
        ? orderModifyWellboreJob(wellbore, updates)
        : orderCreateWellboreJob(wellbore, updates);
    },
    isLoading: isFetching
  };

  return <PropertiesModal {...propertyModalProps} />;
};
