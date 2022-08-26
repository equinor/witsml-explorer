import { Button as MuiButton, CircularProgress as MuiCircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, PropTypes } from "@material-ui/core";
import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { colors } from "../../styles/Colors";

interface ModalDialogProps {
  heading: string;
  content: ReactElement;
  onSubmit: () => void;
  isLoading: boolean;
  confirmColor?: PropTypes.Color;
  confirmText?: string;
  confirmDisabled?: boolean;
  switchButtonPlaces?: boolean;
  errorMessage?: string;
  width?: ModalWidth;
  onCancel?: () => void;
  onDelete?: () => void;
  showSaveButton?: boolean;
}

const ModalDialog = (props: ModalDialogProps): React.ReactElement => {
  const {
    heading,
    content,
    onDelete,
    onSubmit,
    isLoading,
    confirmColor,
    confirmText,
    confirmDisabled,
    errorMessage,
    switchButtonPlaces,
    width = ModalWidth.MEDIUM,
    showSaveButton = true
  } = props;
  const context = React.useContext(OperationContext);
  const { displayModal } = context.operationState;
  const [confirmButtonIsFocused, setConfirmButtonIsFocused] = useState<boolean>(false);
  const confirmButtonIsDisabled = isLoading || confirmDisabled;

  const onCancel =
    props.onCancel ??
    (() => {
      context.dispatchOperation({ type: OperationType.HideModal });
    });

  const onKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !confirmButtonIsDisabled) {
      if (!switchButtonPlaces || confirmButtonIsFocused) onSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const buttons = [
    showSaveButton ? (
      <Button
        key={"confirm"}
        onFocus={() => setConfirmButtonIsFocused(true)}
        onBlur={() => setConfirmButtonIsFocused(false)}
        disabled={confirmButtonIsDisabled}
        onClick={onSubmit}
        color={confirmColor ?? "primary"}
        variant="contained"
      >
        {confirmText ?? "Save"}
      </Button>
    ) : (
      <></>
    ),
    <Button key={"cancel"} disabled={isLoading} onClick={onCancel} color={confirmColor ?? "primary"} variant="outlined">
      Cancel
    </Button>,
    <Button key={"delete"} disabled={isLoading} onClick={onDelete} color={"secondary"} variant="outlined" align={"right"}>
      Delete
    </Button>
  ];

  return (
    <Dialog onKeyDown={onKeyPress} open={displayModal} fullWidth maxWidth={width}>
      <Title>{heading}</Title>
      <Content>
        {content}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <DialogActions>
          {buttons[switchButtonPlaces ? 1 : 0]}
          {buttons[switchButtonPlaces ? 0 : 1]}
          {isLoading && <CircularProgress size="1.5rem" />}
          {onDelete && buttons[2]}
        </DialogActions>
      </Content>
    </Dialog>
  );
};

export enum ModalWidth {
  SMALL = "xs",
  MEDIUM = "sm",
  LARGE = "md"
}

const Title = styled(DialogTitle)`
  border-bottom: 2px solid ${colors.interactive.disabledBorder};
`;

const ErrorMessage = styled.div`
  margin-top: 0.5em;
  color: red;
  line-break: auto;
`;

const Content = styled(DialogContent)`
  margin-top: 0.5em;
`;

const Button = styled(MuiButton)<{ align?: string }>`
  &&& {
    ${({ align }) => (align === "right" ? `margin-left: auto;` : "margin: 0.5em;")};
  }
`;

const CircularProgress = styled(MuiCircularProgress)`
  vertical-align: middle;
`;

export default ModalDialog;
