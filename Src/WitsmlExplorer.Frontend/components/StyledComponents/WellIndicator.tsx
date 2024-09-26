import styled from "styled-components";
import { Colors } from "../../styles/Colors";
import { UserTheme } from "../../contexts/operationStateReducer.tsx";

const dotPaddingTops: { [key in UserTheme]: string } = {
  [UserTheme.Comfortable]: "1.125rem",
  [UserTheme.SemiCompact]: "0.625rem",
  [UserTheme.Compact]: "0.55rem"
};

export const WellIndicator = styled.div<{
  themeMode: UserTheme;
  active: boolean;
  colors: Colors;
}>`
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  margin: ${({ themeMode }) => `${dotPaddingTops[themeMode]} 0.3rem`};
  ${({ colors, active }) =>
    active
      ? `background-color: ${colors.interactive.successHover};`
      : `border: 2px solid ${colors.text.staticIconsTertiary};`}
`;
