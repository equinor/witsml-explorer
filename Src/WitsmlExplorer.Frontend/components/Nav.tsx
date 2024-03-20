import { Breadcrumbs } from "components/Breadcrumbs";
import TopRightCornerMenu from "components/TopRightCornerMenu";
import styled from "styled-components";

export default function Nav() {
  return (
    <NavContainer>
      <Breadcrumbs />
      <TopRightCornerMenu />
    </NavContainer>
  );
}

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
