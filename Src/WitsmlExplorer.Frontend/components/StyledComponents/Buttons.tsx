import { Button } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const StyledButton = styled(Button)<{ colors: Colors }>`
  white-space: nowrap;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
