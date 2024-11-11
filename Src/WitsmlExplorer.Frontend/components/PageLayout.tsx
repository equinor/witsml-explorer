import { useIsAuthenticated } from "@azure/msal-react";
import { Icon } from "@equinor/eds-core-react";
import Alerts from "components/Alerts";
import { DesktopVersion, WebVersion } from "components/ApplicationVersion";
import ContentView from "components/ContentView";
import { preventContextMenuPropagation } from "components/ContextMenus/ContextMenu";
import Nav from "components/Nav";
import PropertiesPanel from "components/PropertiesPanel";
import Sidebar from "components/Sidebar/Sidebar";
import { Button } from "components/StyledComponents/Button";
import useDocumentDimensions from "hooks/useDocumentDimensions";
import { useOperationState } from "hooks/useOperationState";
import { msalEnabled } from "msal/MsalAuthProvider";
import {
  ReactElement,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import { isDesktopApp } from "tools/desktopAppHelpers";

const PageLayout = (): ReactElement => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisibile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(316);
  const { width: documentWidth, height: documentHeight } =
    useDocumentDimensions();
  const { operationState } = useOperationState();
  const { colors } = operationState;

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: {
      stopPropagation: () => void;
      preventDefault: () => void;
      clientX: number;
    }) => {
      if (isResizing) {
        mouseMoveEvent.stopPropagation();
        mouseMoveEvent.preventDefault();
        setSidebarWidth(
          Math.max(
            mouseMoveEvent.clientX -
              sidebarRef.current.getBoundingClientRect().left,
            174
          )
        );
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

  return (
    isVisible && (
      <div onContextMenu={preventContextMenuPropagation}>
        <NavLayout colors={colors}>
          <Nav />
        </NavLayout>
        <MainLayout>
          <SidebarLayout
            colors={colors}
            ref={sidebarRef}
            style={{
              width: sidebarWidth,
              ...(!isSidebarExpanded && { display: "none" })
            }}
          >
            <Sidebar />
          </SidebarLayout>
          <Divider
            onMouseDown={startResizing}
            colors={colors}
            style={{ ...(!isSidebarExpanded && { display: "none" }) }}
          />
          <ContentViewLayout
            style={
              isSidebarExpanded
                ? { width: contentWidth }
                : { width: "100%", gridColumn: "1 / -1" }
            }
          >
            <Alerts />
            <ContentViewDimensionsContext.Provider
              value={{ width: contentWidth, height: documentHeight }}
            >
              <ContentView />
            </ContentViewDimensionsContext.Provider>
          </ContentViewLayout>
          <PropertyBar colors={colors}>
            <Button
              variant={"ghost_icon"}
              style={{ marginRight: "0.5rem" }}
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <Icon
                name={isSidebarExpanded ? "collapse" : "expand"}
                color={colors.text.staticIconsTertiary}
              />
            </Button>
            <Properties>
              <PropertiesPanel />
            </Properties>
            {isDesktopApp() ? <DesktopVersion /> : <WebVersion />}
          </PropertyBar>
        </MainLayout>
      </div>
    )
  );
};

interface ContentViewDimensions {
  width: number;
  height: number;
}

export const ContentViewDimensionsContext =
  createContext<ContentViewDimensions>({} as ContentViewDimensions);

const MainLayout = styled.div`
  display: grid;
  overflow: hidden;
  grid-template-areas:
    "sidebar divider content"
    "footer footer footer";
  height: calc(100vh - var(--navbar-height));
  margin-top: var(--navbar-height);
  grid-template-rows: 1fr var(--properties-bar-height);
`;

const NavLayout = styled.div<{ colors: Colors }>`
  position: fixed;
  top: 0;
  width: 100%;
  height: var(--navbar-height);
  border-bottom: 1px solid ${(prop) => prop.colors.interactive.disabledBorder};
`;

const SidebarLayout = styled.div<{ colors: Colors }>`
  grid-area: sidebar;
  border: solid 0.1em ${(prop) => prop.colors.ui.backgroundLight};
  display: flex;
  flex-direction: column;
  min-width: var(--sidebar-min-width);
  overflow: hidden;
`;

const Divider = styled.div<{ colors: Colors }>`
  justify-self: flex-end;
  cursor: col-resize;
  resize: horizontal;
  width: 0.2rem;
  margin-right: 0.6rem;
  background: ${(props) => props.colors.interactive.sidebarDivider};
  border-radius: 0px 5px 5px 0px;
  &:hover {
    background: ${(props) => props.colors.interactive.sidebarDivider};
    width: 0.6rem;
    margin-right: 0.2rem;
  }
`;

const ContentViewLayout = styled.div`
  grid-area: content;
  overflow-y: auto;
  overflow-x: auto;
  word-wrap: wrap;
`;

const PropertyBar = styled.div<{ colors: Colors }>`
  grid-area: footer;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;

  height: var(--properties-bar-height);
  background-color: ${(props) => props.colors.ui.backgroundLight};
  align-items: center;
  padding-right: 0.5rem;
`;

const Properties = styled.div`
  display: flex;
  align-items: center;
`;

export default PageLayout;
