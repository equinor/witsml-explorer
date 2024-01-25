import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const LabelsLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 0.8rem;
`;

export const ComparisonCell = styled.div<{ type?: string }>`
  font-feature-settings: "tnum";
  p {
    text-align: ${({ type }) => (type == "depth" ? "right" : "left")};
  }
  mark {
    background: #e6faec;
    background-blend-mode: darken;
    font-weight: 600;
  }
`;

export const TableLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledTypography = styled(Typography)<{ colors: Colors }>`
  padding: 1rem 0 1rem 0;
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;
