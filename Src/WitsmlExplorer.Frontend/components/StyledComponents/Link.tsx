import { Link } from "react-router-dom";
import styled from "styled-components";
import { Colors } from "styles/Colors";

const StyledLink = styled(Link)<{ colors: Colors }>`
  color: ${({ colors }) => colors.interactive.primaryResting};
  text-decoration: underline;
  &:visited {
    color: ${({ colors }) => colors.interactive.primaryResting};
  }
  &:hover {
    color: ${({ colors }) => colors.interactive.primaryHover};
  }
`;

export default StyledLink;
