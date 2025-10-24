import { Typography as EdsTypography } from "@equinor/eds-core-react";
import styled, { css } from "styled-components";
import { Colors } from "styles/Colors";

export const Typography = styled(EdsTypography)<{
  colors: Colors;
  $primary?: boolean;
}>`
  ${({ $primary, colors }) =>
    !$primary
      ? ""
      : css`
          &[class*="Typography__StyledTypography"] {
            color: ${colors.interactive.primaryResting};
          }
        `}
`;
