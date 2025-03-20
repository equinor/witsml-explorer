import { Dialog, Progress, Typography } from "@equinor/eds-core-react";
import { Button } from "components/StyledComponents/Button";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import React, { ReactElement, useState } from "react";
import styled, { css } from "styled-components";
import { Colors, dark, light } from "styles/Colors";
import Icons from "styles/Icons";
import { ErrorMessage } from "../StyledComponents/ErrorMessage";
import { ModalContentLayout } from "../StyledComponents/ModalContentLayout";
import { UserTheme } from "../../contexts/operationStateReducer.tsx";

interface ModalDialogProps {
  heading: string;
  content: ReactElement;
  onSubmit: () => void;
  isLoading: boolean;
  confirmColor?: "primary" | "secondary" | "danger";
  confirmText?: string;
  confirmDisabled?: boolean;
  switchButtonPlaces?: boolean;
  errorMessage?: string;
  width?: ModalWidth;
  onCancel?: () => void;
  onDelete?: () => void;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  buttonPosition?: ControlButtonPosition;
  cancelText?: string;
  height?: string;
  minHeight?: string;
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
    height,
    showConfirmButton = true,
    showCancelButton = true,
    buttonPosition: ButtonPosition = ControlButtonPosition.BOTTOM,
    cancelText,
    minHeight
  } = props;
  const context = useOperationState();
  const [confirmButtonIsFocused, setConfirmButtonIsFocused] =
    useState<boolean>(false);
  const { operationState } = context;
  const colors: Colors = operationState?.colors || light;
  const isCompact = context.operationState.theme === UserTheme.Compact;
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
      isLoading ? (
        <StyledButton style={{ cursor: "not-allowed" }} isCompact={isCompact}>
          <Progress.Dots />
        </StyledButton>
      ) : (
        <StyledButton
          key={"confirm"}
          onFocus={() => setConfirmButtonIsFocused(true)}
          onBlur={() => setConfirmButtonIsFocused(false)}
          disabled={confirmButtonIsDisabled}
          onClick={onSubmit}
          color={confirmColor ?? "primary"}
          variant="contained"
        >
          {ButtonPosition == ControlButtonPosition.TOP ? (
            <Icons name="save" />
          ) : (
            ""
          )}
          {confirmText ?? "Save"}
        </StyledButton>
      )
    ) : (
      <></>
    ),
    showCancelButton ? (
      <StyledButton
        key={"cancel"}
        disabled={isLoading}
        onClick={onCancel}
        color={confirmColor ?? "primary"}
        variant="outlined"
      >
        {cancelText ?? "Cancel"}
      </StyledButton>
    ) : (
      <></>
    ),
    <StyledButton
      key={"delete"}
      disabled={isLoading}
      onClick={onDelete}
      color={"danger"}
      variant="contained"
      align={"right"}
      style={{ marginLeft: "auto", margin: "0.5em", float: "right" }}
    >
      Delete
    </StyledButton>
  ];

  const top = (
    <HeadTitle colors={colors}>
      <Typography
        color="primary"
        style={{
          color: colors.infographic.primaryMossGreen
        }}
        token={{
          fontSize: "1.5rem",
          fontWeight: 600
        }}
      >
        {heading}
      </Typography>
      <Typography style={{ display: "flex" }}>
        {buttons[switchButtonPlaces ? 1 : 0]}
        {buttons[switchButtonPlaces ? 0 : 1]}
        {ButtonPosition ? <></> : onDelete && buttons[2]}
      </Typography>
    </HeadTitle>
  );
  const bottom = (
    <Dialog.Actions>
      {buttons[switchButtonPlaces ? 1 : 0]}
      {buttons[switchButtonPlaces ? 0 : 1]}
      {onDelete && buttons[2]}
    </Dialog.Actions>
  );
  const header = (
    <DialogHeader colors={colors}>
      <Dialog.Title style={{ color: colors.text.staticIconsDefault }}>
        {heading}
      </Dialog.Title>
    </DialogHeader>
  );
  const dialogStyle = {
    width: width,
    height: height,
    background: colors.ui.backgroundDefault,
    color: colors.text.staticIconsDefault
  };

  return (
    <Dialog onKeyDown={onKeyPress} open={true} style={dialogStyle}>
      {ButtonPosition == ControlButtonPosition.TOP ? top : header}
      <Content colors={colors} minHeight={minHeight}>
        {content}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </Content>
      {ButtonPosition == ControlButtonPosition.BOTTOM ? bottom : <></>}
    </Dialog>
  );
};

export enum ModalWidth {
  SMALL = "444px", // xs
  MEDIUM = "600px", // sm
  LARGE = "960px" // md
}

const HeadTitle = styled.div<{ colors?: Colors }>`
  margin-top: 0.5rem;
  display: flex;
  padding: 0.5rem 2rem;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid ${(props) => props.colors.interactive.disabledBorder};
`;

export { ModalContentLayout };

export enum ControlButtonPosition {
  TOP = "top",
  BOTTOM = "bottom"
}

const Content = styled(Dialog.CustomContent)<{
  colors: Colors;
  minHeight: string;
}>`
  margin-top: 0.5em;
  max-height: 75vh;
  min-height: ${(props) => (props.minHeight ? props.minHeight : "")};
  overflow-y: auto;
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  color: ${(props) => props.colors.text.staticIconsDefault};

  div[class*="InputWrapper__Container"] {
    label {
      color: ${(props) => props.colors.text.staticTextLabel};
    }
  }

  div[class*="Input__Container"][disabled] {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
    border-bottom: 1px solid #575d63;
  }

  div[class*="Input__Container"] {
    background-color: ${(props) => props.colors.text.staticTextFieldDefault};
  }

  div[class*="DateTimeField__Layout"] {
    svg {
      fill: ${(props) => props.colors.text.staticIconsDefault};
    }

    label {
      color: ${(props) => props.colors.text.staticIconsDefault};
    }
  }

  div[class*="Autocomplete__Container"] {
    label {
      color: ${(props) => props.colors.text.staticTextLabel};
    }
  }

  div[class*="MuiButtonGroup-root"] {
    button {
      background-color: transparent;
      color: ${(props) => props.colors.infographic.primaryMossGreen};
    }
  }

  input[type="datetime-local"] {
    color-scheme: ${({ colors }) => (colors === dark ? "dark" : "")};
  }

  h2[class*="AccordionHeader__StyledAccordionHeader"] {
    background-color: transparent;
    border: 1px solid #575d63;
    label {
      color: ${(props) => props.colors.text.staticTextLabel};
    }
  }

  div[class*="AccordionPanel__StyledAccordionPanel"] {
    background-color: transparent;
    border-top: 0px;
    border-bottom: 1px solid #575d63;
    border-left: 1px solid #575d63;
    border-right: 1px solid #575d63;
    label {
      color: ${(props) => props.colors.text.staticTextLabel};
    }
  }

  ${({ colors }) =>
    colors === dark
      ? `
      button[disabled]:disabled {
        background: #565656;
        border:1px solid #565656;
        color:#9CA6AC;
      }
      button[class*="Autocomplete__StyledButton"]:disabled {
        background: none;
        border: none;
      }
      `
      : ""};
`;

const DialogHeader = styled(Dialog.Header)<{ colors: Colors }>`
  hr {
    background-color: ${(props) => props.colors.interactive.disabledBorder};
  }
`;

const StyledButton = styled(Button)<{ align?: string; isCompact?: boolean }>`
  &&& {
    ${({ align }) =>
      align === "right" ? `margin-left: auto;` : "margin: 0.5em;"};
  }

  ${({ isCompact }) =>
    !isCompact
      ? ""
      : css`
          & > span > svg {
            height: 10px !important;
          }
        `}
`;

export default ModalDialog;
