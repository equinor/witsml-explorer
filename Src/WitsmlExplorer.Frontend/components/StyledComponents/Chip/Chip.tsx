import React, { forwardRef } from "react";
import {
  Chip as EdsChip,
  ChipProps as EdsChipProps
} from "@equinor/eds-core-react";
import styled, { css } from "styled-components";
import { Colors } from "../../../styles/Colors.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";

type WithTheme<T = object> = T & { colors: Colors };

type ChipProps = Omit<EdsChipProps, "variant"> & {
  variant?: "active" | "error" | "default" | "warning";
};

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  ({ variant = "default", children, ...props }, ref) => {
    const {
      operationState: { colors }
    } = useOperationState();

    // Equinor EDS Chip crashes if any child is null/undefined (accesses child.props directly).
    // React.Children.toArray removes null, undefined, and booleans.
    const safeChildren = React.Children.toArray(children);

    switch (variant) {
      case "default":
        return (
          <WitsmlDefaultChip
            ref={ref}
            {...props}
            variant={variant}
            colors={colors}
          >
            {safeChildren}
          </WitsmlDefaultChip>
        );
      case "warning":
        return (
          <WitsmlWarnChip ref={ref} {...props} colors={colors}>
            {safeChildren}
          </WitsmlWarnChip>
        );
      default:
        return (
          <EdsChip ref={ref} {...props} variant={variant}>
            {safeChildren}
          </EdsChip>
        );
    }
  }
);

Chip.displayName = "WitsmlExplorerChip";

const WitsmlDefaultChip = styled(EdsChip)<WithTheme>`
  ${({ colors: { ui, mode, interactive, text } }) => {
    if (mode === "light") return;

    return css`
      --eds_ui_background__light: ${ui.backgroundLight};
      --eds_interactive_primary__resting: ${interactive.primaryResting};
      --eds_interactive_primary__hover_alt: ${ui.backgroundDefault};
      --eds_interactive_primary__hover: ${text.staticPropertyValue};
    `;
  }}
`;

const WitsmlWarnChip = styled(EdsChip)<WithTheme>`
  ${({ colors: { mode, interactive, text } }) => {
    if (mode === "light") return;

    return css`
      --eds_ui_background__light: ${interactive.warningHover};
      --eds_interactive_primary__resting: ${text.staticIconsPrimaryBlack};
      --eds_interactive_primary__hover: ${interactive.warningResting};
    `;
  }}
`;
