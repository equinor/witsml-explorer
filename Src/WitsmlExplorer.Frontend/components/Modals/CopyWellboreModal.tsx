import ConfirmModal from "components/Modals/ConfirmModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";

export function displayCopyWellboreModal(
  wellboreUid: string,
  dispatchOperation: DispatchOperation,
  onConfirm: () => void
) {
  const content = (
    <span>
      The wellbore {wellboreUid} does not exist on the target server. Do you
      want to copy it and its parent well?
    </span>
  );

  const confirmation = (
    <ConfirmModal
      heading={`Copy wellbore?`}
      content={content}
      onConfirm={onConfirm}
      confirmColor={"primary"}
      confirmText={`Copy`}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmation
  });
}
