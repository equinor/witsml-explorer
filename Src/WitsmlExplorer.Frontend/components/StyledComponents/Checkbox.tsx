import { Checkbox as EdsCheckbox } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const Checkbox = styled(EdsCheckbox)<{ colors: Colors }>`
  span {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
`;
