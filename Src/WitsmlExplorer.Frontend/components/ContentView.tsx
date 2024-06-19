import { Outlet } from "react-router-dom";
import styled from "styled-components";

export default function ContentView() {
  return (
    <ContentPanel>
      <Outlet />
    </ContentPanel>
  );
}

const ContentPanel = styled.div`
  position: relative;
  height: 100%;
`;
