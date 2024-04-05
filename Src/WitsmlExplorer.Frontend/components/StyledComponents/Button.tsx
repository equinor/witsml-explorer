import {
  Button as EdsButton,
  ButtonProps as EdsButtonProps
} from "@equinor/eds-core-react";
import OperationContext from "contexts/operationContext";
import { UserTheme } from "contexts/operationStateReducer";
import React, { useContext } from "react";
import styled, { css } from "styled-components";
import { Colors } from "styles/Colors";

export interface ButtonProps extends Omit<EdsButtonProps, "variant"> {
  variant?: EdsButtonProps["variant"] | "table_icon";
}

export type Ref = HTMLButtonElement;

export const Button = React.forwardRef<Ref, ButtonProps>((props, ref) => {
  const {
    operationState: { colors, theme }
  } = useContext(OperationContext);

  if (!props.variant || props.variant === "contained") {
    return <ContainedButton ref={ref} {...props} colors={colors} />;
  } else if (props.variant === "contained_icon") {
    return <EdsButton ref={ref} {...(props as EdsButtonProps)} />;
  } else if (props.variant === "outlined") {
    return <OutlinedButton ref={ref} {...props} colors={colors} />;
  } else if (props.variant === "ghost") {
    return <GhostButton ref={ref} {...props} colors={colors} />;
  } else if (props.variant === "ghost_icon") {
    return <GhostIconButton ref={ref} {...props} colors={colors} />;
  } else if (props.variant === "table_icon") {
    return (
      <TableIconButtonLayout>
        <TableIconButton
          ref={ref}
          {...props}
          variant="ghost_icon"
          colors={colors}
          userTheme={theme}
        />
      </TableIconButtonLayout>
    );
  } else {
    throw Error(`Button variant ${props.variant} is not supported!`);
  }
});

Button.displayName = "WitsmlExplorerButton";

const ContainedButton = styled(EdsButton)<{ colors: Colors }>`
  ${(props) =>
    props?.colors?.mode === "dark"
      ? `
        &&:disabled {
        background: #565656;
        border:1px solid #565656;
        color:#9CA6AC;
      }`
      : ""};
`;

const GhostButton = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const GhostIconButton = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const TableIconButton = styled(EdsButton)<{
  colors: Colors;
  userTheme: UserTheme;
}>`
  white-space: nowrap;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  ${(props) =>
    props.userTheme === UserTheme.Compact &&
    css`
      height: 22px;
      width: 22px;
      &::after {
        width: 22px;
        height: 22px;
      }
    `}
  ${(props) =>
    (!props.color || props.color === "primary") &&
    css<{ colors: Colors }>`
      color: ${(props) => props.colors.infographic.primaryMossGreen};
    `}
`;

const OutlinedButton = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const TableIconButtonLayout = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
