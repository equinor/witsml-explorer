import styled from "styled-components";
import { Colors } from "../../styles/Colors";

export const WellIndicator = styled.div<{
  compactMode: boolean;
  active: boolean;
  colors: Colors;
}>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: ${(props) =>
    props.compactMode ? "0.625rem 0 0 0.5rem" : "1.125rem 0 0 0.5rem"};
  ${(props) =>
    props.active
      ? `background-color: ${props.colors.interactive.successHover};`
      : `border: 2px solid ${props.colors.text.staticIconsTertiary};`}
`;
