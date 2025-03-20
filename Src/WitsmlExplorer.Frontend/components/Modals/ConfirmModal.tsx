import ModalDialog from "components/Modals/ModalDialog";
import React, { ReactElement } from "react";

interface ConfirmProps {
  heading: string;
  content: ReactElement;
  onConfirm: () => void;
  confirmColor?: "primary" | "secondary" | "danger";
  confirmText?: string;
  switchButtonPlaces?: boolean;
  showCancelButton?: boolean;
  cancelText?: string;
  confirmDisabled?: boolean;
}

const ConfirmModal = (props: ConfirmProps): React.ReactElement => {
  return (
    <ModalDialog
      heading={props.heading}
      content={props.content}
      onSubmit={props.onConfirm}
      isLoading={false}
      confirmText={props.confirmText ?? "Yes"}
      cancelText={props.cancelText}
      confirmColor={props.confirmColor}
      switchButtonPlaces={props.switchButtonPlaces}
      showCancelButton={props.showCancelButton}
      confirmDisabled={props.confirmDisabled}
    />
  );
};

export default ConfirmModal;
