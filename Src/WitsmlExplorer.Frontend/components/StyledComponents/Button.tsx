import { Button as EdsButton } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const Button = styled(EdsButton)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
