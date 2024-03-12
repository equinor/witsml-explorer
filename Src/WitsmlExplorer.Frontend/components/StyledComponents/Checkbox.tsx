import { Checkbox as EdsCheckbox } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const Checkbox = styled(EdsCheckbox)<{
  colors: Colors;
  disabled?: boolean;
}>`
  span {
    color: ${(props) =>
      props.disabled
        ? props.colors.text.disabledText
        : props.colors.infographic.primaryMossGreen};
  }
  input[type="checkbox"] + svg {
    fill: ${(props) =>
      props.disabled
        ? props.colors.text.disabledText
        : props.colors.infographic.primaryMossGreen};
  }
`;
