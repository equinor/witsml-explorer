import {
  Button as EdsButton,
  ButtonProps as EdsButtonProps
} from "@equinor/eds-core-react";
import { UserTheme } from "contexts/operationStateReducer";
import { useOperationState } from "hooks/useOperationState";
import React, {
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes
} from "react";
import styled, { css } from "styled-components";
import { Colors } from "styles/Colors";

export interface ButtonProps extends Omit<EdsButtonProps, "variant"> {
  variant?: EdsButtonProps["variant"] | "table_icon";
}

export type Ref = HTMLButtonElement;

type ComposedExoticButton = ForwardRefExoticComponent<
  ButtonProps & RefAttributes<HTMLButtonElement>
> & {
  Group: typeof EdsButton.Group;
};

const StyledEdsButton = styled(EdsButton)<{
  isCompact: boolean;
}>`
  ${({ isCompact }) =>
    !isCompact
      ? ""
      : css`
          --eds_button__padding_x: 0.5rem;
          --eds_button__padding_y_compact: 2px;

          & > span > svg {
            height: 18px !important;
            width: 18px !important;
          }
        `}
`;

const ExoticButton = forwardRef<Ref, ButtonProps>((props, ref) => {
  const {
    operationState: { colors, theme }
  } = useOperationState();
  const isCompact = theme === UserTheme.Compact;

  if (!props.variant || props.variant === "contained") {
    return (
      <ContainedButton
        ref={ref}
        {...props}
        colors={colors}
        isCompact={isCompact}
      />
    );
  } else if (props.variant === "contained_icon") {
    return (
      <StyledEdsButton
        ref={ref}
        {...(props as EdsButtonProps)}
        isCompact={isCompact}
      />
    );
  } else if (props.variant === "outlined") {
    return (
      <OutlinedButton
        ref={ref}
        {...props}
        colors={colors}
        isCompact={isCompact}
      />
    );
  } else if (props.variant === "ghost") {
    return (
      <GhostButton ref={ref} {...props} colors={colors} isCompact={isCompact} />
    );
  } else if (props.variant === "ghost_icon") {
    return (
      <GhostIconButton
        ref={ref}
        {...props}
        colors={colors}
        isCompact={isCompact}
      />
    );
  } else if (props.variant === "table_icon") {
    return (
      <TableIconButtonLayout>
        <TableIconButton
          ref={ref}
          {...props}
          variant="ghost_icon"
          colors={colors}
          userTheme={theme}
          isCompact={isCompact}
        />
      </TableIconButtonLayout>
    );
  } else {
    throw Error(`Button variant ${props.variant} is not supported!`);
  }
});

ExoticButton.displayName = "WitsmlExplorerButton";

export const Button: ComposedExoticButton = Object.assign(ExoticButton, {
  Group: EdsButton.Group
});

const ContainedButton = styled(StyledEdsButton)<{ colors: Colors }>`
  ${(props) =>
    props?.colors?.mode === "dark"
      ? css`
          &&:disabled {
            background: #565656;
            border: 1px solid #565656;
            color: #9ca6ac;
          }
        `
      : ""};
`;

const GhostButton = styled(StyledEdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const GhostIconButton = styled(StyledEdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const TableIconButton = styled(StyledEdsButton)<{
  colors: Colors;
  userTheme: UserTheme;
}>`
  white-space: nowrap;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  ${({ isCompact }) =>
    isCompact &&
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

const OutlinedButton = styled(StyledEdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

const TableIconButtonLayout = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
