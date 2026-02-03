import { Tabs } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const StyledTab = styled(Tabs.Tab)<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
