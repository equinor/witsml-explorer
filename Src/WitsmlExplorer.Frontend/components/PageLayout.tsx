import { useIsAuthenticated } from "@azure/msal-react";
import { Typography } from "@equinor/eds-core-react";
import { ReactElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Alerts from "../components/Alerts";
import ContentView from "../components/ContentView";
import { preventContextMenuPropagation } from "../components/ContextMenus/ContextMenu";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar/Sidebar";
import NavigationContext from "../contexts/navigationContext";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import { msalEnabled } from "../msal/MsalAuthProvider";
import { colors } from "../styles/Colors";
import PropertiesPanel from "./PropertiesPanel";

const PageLayout = (): ReactElement => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisibile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(316);
  const { width: documentWidth } = useDocumentDimensions();
  const { navigationState } = useContext(NavigationContext);
  const { currentProperties } = navigationState;
  const version = process.env.NEXT_PUBLIC_WEX_VERSION;

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
      <PropertyBar>
        <Properties>
          <PropertiesPanel properties={currentProperties} />
        </Properties>
        {version && <Typography token={{ fontFamily: "Equinor", fontSize: "0.875rem", color: colors.text.staticIconsTertiary }}>v.{version}</Typography>}
      </PropertyBar>
    </Layout>
  ) : (
    <></>
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar divider content"
    "footer footer footer";
  height: 100vh;
  grid-template-rows: 40px 1fr 40px;
`;

const NavLayout = styled.div`
  grid-area: header;
  height: 40px;
  border-bottom: 1px solid ${colors.interactive.disabledBorder};
`;

const SidebarLayout = styled.div`
  grid-area: sidebar;
  border: solid 0.1em ${colors.ui.backgroundLight};
  display: flex;
  flex-direction: column;
  min-width: 174px;
  overflow: scroll;
`;

const Divider = styled.div`
  justify-self: flex-end;
  cursor: col-resize;
  resize: horizontal;
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
  padding-right: 0.2rem;
`;

const PropertyBar = styled.div`
  width: 100vw;
  height: 40px;
  background-color: ${colors.ui.backgroundLight};
  grid-area: footer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 1.6rem;
  padding-right: 1.6rem;
`;

const Properties = styled.div`
  width: 95vw;
  display: flex;
  align-items: center;
`;

export default PageLayout;
