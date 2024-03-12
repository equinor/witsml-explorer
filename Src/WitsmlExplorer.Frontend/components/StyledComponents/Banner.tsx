import { Banner as EdsBanner } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const Banner = styled(EdsBanner)<{ colors: Colors }>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  span {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  div {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
  p {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  hr {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;
