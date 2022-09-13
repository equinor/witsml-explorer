import { PropTypes } from "@material-ui/core";
import React, { ReactElement } from "react";
import ModalDialog from "./ModalDialog";

interface ConfirmProps {
  heading: string;
  content: ReactElement;
  onConfirm: () => void;
  confirmColor?: PropTypes.Color;
  confirmText?: string;
  switchButtonPlaces?: boolean;
  showCancelButton?: boolean;
}

const ConfirmModal = (props: ConfirmProps): React.ReactElement => {
  return (
    <ModalDialog
      heading={props.heading}
      content={props.content}
      onSubmit={props.onConfirm}
      isLoading={false}
      confirmText={props.confirmText ?? "Yes"}
      confirmColor={props.confirmColor}
      switchButtonPlaces={props.switchButtonPlaces}
      showCancelButton={props.showCancelButton}
    />
  );
};

export default ConfirmModal;
