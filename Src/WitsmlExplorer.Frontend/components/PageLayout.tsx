import { useIsAuthenticated } from "@azure/msal-react";
import { ReactElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Alerts from "../components/Alerts";
import ContentView from "../components/ContentView";
import { preventContextMenuPropagation } from "../components/ContextMenus/ContextMenu";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar/Sidebar";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import { msalEnabled } from "../msal/MsalAuthProvider";
import { colors } from "../styles/Colors";
import PropertiesPanel from "./PropertiesPanel";
import NavigationContext from "../contexts/navigationContext";

const PageLayout = (): ReactElement => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisibile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(316);
  const { width: documentWidth } = useDocumentDimensions();
  const { navigationState } = useContext(NavigationContext);
  const { currentProperties, selectedServer } = navigationState;

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
      {selectedServer ? < Divider onMouseDown={startResizing} /> : <></>}
      <ContentViewLayout style={{ width: contentWidth }}>
        <Alerts />
        <ContentView />
      </ContentViewLayout>
      <PropertyBar>
        <PropertiesPanel properties={currentProperties} />
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
  border-bottom:1px solid ${colors.interactive.disabledBorder};
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
    background:${colors.interactive.primaryHover};
    width: 0.6rem;
    margin-right: 0.2rem;
  }
`;

const ContentViewLayout = styled.div`
  grid-area: content;
  overflow-y: auto;
  overflow-x: auto;
  word-wrap: wrap;;
  padding-right: 0.2rem;
`;
const PropertyBar = styled.div`{
  width:100vw;
  height:40px;
  background-color: ${colors.ui.backgroundLight};
  grid-area:footer;
  display:flex;
  align-items: center;
  padding-left:1.6rem;
}`
export default PageLayout;
