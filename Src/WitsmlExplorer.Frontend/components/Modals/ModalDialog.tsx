import { Button, Dialog } from "@equinor/eds-core-react";
import { CircularProgress as MuiCircularProgress, PropTypes } from "@material-ui/core";
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
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
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
    showConfirmButton = true,
    showCancelButton = true
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
    showConfirmButton ? (
      <StyledButton
        key={"confirm"}
        onFocus={() => setConfirmButtonIsFocused(true)}
        onBlur={() => setConfirmButtonIsFocused(false)}
        disabled={confirmButtonIsDisabled}
        onClick={onSubmit}
        color={confirmColor ?? "primary"}
        variant="contained"
      >
        {confirmText ?? "Save"}
      </StyledButton>
    ) : (
      <></>
    ),
    showCancelButton ? (
      <StyledButton key={"cancel"} disabled={isLoading} onClick={onCancel} color={confirmColor ?? "primary"} variant="outlined">
        Cancel
      </StyledButton>
    ) : (
      <></>
    ),
    <StyledButton key={"delete"} disabled={isLoading} onClick={onDelete} color={"danger"} variant="outlined" align={"right"} style={{ marginLeft: "auto", margin: "0.5em", float: "right" }}>
      Delete
    </StyledButton>
  ];

  return (
    <Dialog onKeyDown={onKeyPress} open={displayModal} style={{ width: width }}>
      <Dialog.Header>
        <Title>{heading}</Title>
      </Dialog.Header>

      <Content>
        {content}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      </Content>
      <Dialog.Actions style={{ width: "100%" }} >
        {buttons[switchButtonPlaces ? 1 : 0]}
        {buttons[switchButtonPlaces ? 0 : 1]}
        {isLoading && <CircularProgress size="1.5rem" />}
        {onDelete && buttons[2]}
      </Dialog.Actions>
    </Dialog>

  );
};

export enum ModalWidth {
  SMALL = "444px", // xs 
  MEDIUM = "600px", // sm
  LARGE = "960px" // md
}

const Title = styled(Dialog.Title)`
  border-bottom: 2px solid ${colors.interactive.disabledBorder};
`;

const ErrorMessage = styled.div`
  margin-top: 0.5em;
  color: red;
  line-break: auto;
`;

const Content = styled(Dialog.CustomContent)`
  margin-top: 0.5em;
`;

const StyledButton = styled(Button) <{ align?: string }>`
  &&& {
    ${({ align }) => (align === "right" ? `margin-left: auto;` : "margin: 0.5em;")};
  }
`;

const CircularProgress = styled(MuiCircularProgress)`
  vertical-align: middle;
`;

export default ModalDialog;
