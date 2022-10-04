import { useIsAuthenticated } from "@azure/msal-react";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Alerts from "../components/Alerts";
import ContentView from "../components/ContentView";
import { preventContextMenuPropagation } from "../components/ContextMenus/ContextMenu";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar/Sidebar";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import { msalEnabled } from "../msal/MsalAuthProvider";
import { colors } from "../styles/Colors";

const PageLayout = (): ReactElement => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisibile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(268);
  const { width: documentWidth } = useDocumentDimensions();

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: { stopPropagation: () => void; preventDefault: () => void; clientX: number }) => {
      if (isResizing) {
        mouseMoveEvent.stopPropagation();
        mouseMoveEvent.preventDefault();
        setSidebarWidth(mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const approximateDividerWidth = 13;
  const contentWidth = documentWidth - sidebarWidth - approximateDividerWidth;

  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  useEffect(() => {
    setIsVisibile(isAuthenticated);
  }, [isAuthenticated]);

  return isVisible ? (
    <Layout onContextMenu={preventContextMenuPropagation}>
      <NavLayout>
        <Nav />
      </NavLayout>
      <SidebarLayout ref={sidebarRef} style={{ width: sidebarWidth }}>
        <Sidebar />
      </SidebarLayout>
      <Divider onMouseDown={startResizing} />
      <ContentViewLayout style={{ width: contentWidth }}>
        <Alerts />
        <ContentView />
      </ContentViewLayout>
    </Layout>
  ) : (
    <></>
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar divider content";
  height: 100vh;
`;

const NavLayout = styled.div`
  grid-area: header;
  height: 3vh;
  min-height: 3rem;
`;

const SidebarLayout = styled.div`
  grid-area: sidebar;
  border: solid 0.1em ${colors.ui.backgroundLight};
  display: flex;
  flex-direction: column;
  height: 93vh;
  min-width: 174px;
`;

const Divider = styled.div`
  justify-self: flex-end;
  cursor: col-resize;
  resize: horizontal;
  height: 93vh;
  width: 0.2rem;
  margin-right: 0.6rem;
  background: ${colors.interactive.primaryResting};
  border-radius: 0px 5px 5px 0px;
  &:hover {
    background: ${colors.interactive.primaryHover};
    width: 0.6rem;
    margin-right: 0.2rem;
  }
`;

const ContentViewLayout = styled.div`
  grid-area: content;
  overflow-y: auto;
  overflow-x: auto;
  word-wrap: wrap;
  height: 93vh;
  padding-right: 0.2rem;
`;

export default PageLayout;
