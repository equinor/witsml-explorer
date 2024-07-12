import React, { forwardRef } from "react";
import { Chip as EquinorChip, ChipProps } from "@equinor/eds-core-react";
import styled, { css } from "styled-components";
import { Colors } from "../../../styles/Colors.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";

type WithTheme<T = object> = T & { colors: Colors };

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  ({ variant = "default", ...props }, ref) => {
    const {
      operationState: { colors }
    } = useOperationState();

    const commonProps = { ref, variant, ...props };

    switch (variant) {
      case "default":
        return <WitsmlDefaultChip {...commonProps} colors={colors} />;
      default:
        return <EquinorChip {...commonProps} />;
    }
  }
);

Chip.displayName = "WitsmlExplorerChip";

const WitsmlDefaultChip = styled(EquinorChip)<WithTheme>`
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
