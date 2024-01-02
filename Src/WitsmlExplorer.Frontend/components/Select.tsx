import { NativeSelect } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const StyledNativeSelect = styled(NativeSelect)<{ colors: Colors }>`
  select {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
    color: ${(props) => props.colors.text.staticIconsDefault};
    option {
      background: ${(props) => props.colors.ui.backgroundLight};
      color: ${(props) => props.colors.text.staticIconsDefault};
    }
  }
  label {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
`;
