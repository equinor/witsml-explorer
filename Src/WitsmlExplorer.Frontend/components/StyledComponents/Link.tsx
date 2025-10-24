import { Link } from "react-router-dom";
import styled from "styled-components";
import { Colors } from "styles/Colors";

export const StyledLink = styled(Link)<{ colors: Colors }>`
  color: ${({ colors }) => colors.interactive.primaryResting};
  text-decoration: underline;

  svg {
    margin-right: 0.2rem;
    vertical-align: middle;
  }

  &:visited {
    color: ${({ colors }) => colors.interactive.primaryResting};
  }

  &:hover {
    color: ${({ colors }) => colors.interactive.primaryHover};
  }
`;

export const StyledLinkButton = styled.div<{ colors: Colors }>`
  color: ${({ colors }) => colors.interactive.primaryResting};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: ${({ colors }) => colors.interactive.primaryHover};
  }
`;
