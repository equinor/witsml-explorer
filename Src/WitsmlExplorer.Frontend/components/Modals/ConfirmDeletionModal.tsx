import { ModalContentLayout } from "components/Modals/ModalDialog";
import { Checkbox } from "components/StyledComponents/Checkbox";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import React, { ChangeEvent, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import WarningBar from "components/WarningBar";

export interface ConfirmDeletionModalProps {
  componentType: string;
  objectName: string;
  objectUid: string;
  onSubmit: (cascadedDelete: boolean) => void;
}

const ConfirmDeletionModal = (
  props: ConfirmDeletionModalProps
): React.ReactElement => {
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();

  const [cascadedDelete, setCascadedDelete] = useState<boolean>(false);

  const onConfirmClick = async () => {
    props.onSubmit(cascadedDelete);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <ConfirmModal
      heading={"Delete " + props.componentType + "?"}
      content={
        <>
          <ModalContentLayout>
            <span>
              This will permanently delete {props.componentType}{" "}
              <strong>{props.objectName}</strong> with uid:{" "}
              <strong>{props.objectUid}</strong>
            </span>

            <Checkbox
              label={`Delete all objects under ` + props.componentType + `?`}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCascadedDelete(e.target.checked);
              }}
              colors={colors}
            />

            {cascadedDelete && (
              <WarningBar
                message={
                  `This action will permanently delete the ${props.componentType} ` +
                  `'${props.objectName}' and all associated objects. ` +
                  `This cannot be undone. Please ensure you want to delete the entire structure.`
                }
              />
            )}
          </ModalContentLayout>
        </>
      }
      onConfirm={onConfirmClick}
      confirmColor={"danger"}
      confirmText={"Delete " + props.componentType}
      switchButtonPlaces={true}
    />
  );
};

export default ConfirmDeletionModal;
