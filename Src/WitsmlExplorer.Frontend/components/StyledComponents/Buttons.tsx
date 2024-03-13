import { Button } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors, colors } from "styles/Colors";

// A styled button to get the correct color when using the ghost or outlined variants (no fill)
export const StyledGhostButton = styled(Button)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

export const OutlinedIconButton = styled(Button)`
  ${(props) =>
    props.disabled
      ? `
      &:hover{
        border:2px solid ${colors.interactive.disabledBorder};
        border-radius: 50%;
      }
      &&{
        border:2px solid ${colors.interactive.disabledBorder};
      }`
      : `
      &:hover{
        border-radius: 50%;
      }
      &&{
        border:2px solid ${colors.interactive.primaryResting};
      }`}
  display:flex;
  height: 2rem;
  width: 2rem;
  min-height: 2rem;
  min-width: 2rem;
  padding: 0;
  align-items: center;
  justify-content: center;
`;
