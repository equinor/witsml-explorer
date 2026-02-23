import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ReactElement, useEffect } from "react";
import ReleaseNotesModal from "./Modals/ReleaseNotesModal.tsx";

export function ReleaseNotesHandler(): ReactElement {
  const { dispatchOperation } = useOperationState();
  const openReleaseNotes = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ReleaseNotesModal />
    });
  };

  useEffect(() => {
    openReleaseNotes();
  }, []);

  return null;
}
