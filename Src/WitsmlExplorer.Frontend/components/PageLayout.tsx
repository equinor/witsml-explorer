import { useIsAuthenticated } from "@azure/msal-react";
import { Icon, Typography } from "@equinor/eds-core-react";
import Alerts from "components/Alerts";
import ContentView from "components/ContentView";
import { preventContextMenuPropagation } from "components/ContextMenus/ContextMenu";
import Nav from "components/Nav";
import PropertiesPanel from "components/PropertiesPanel";
import Sidebar from "components/Sidebar/Sidebar";
import { Button } from "components/StyledComponents/Button";
import OperationContext from "contexts/operationContext";
import useDocumentDimensions from "hooks/useDocumentDimensions";
import { msalEnabled } from "msal/MsalAuthProvider";
import {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

const PageLayout = (): ReactElement => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisibile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(316);
  const { width: documentWidth, height: documentHeight } =
    useDocumentDimensions();
  const version = process.env.NEXT_PUBLIC_WEX_VERSION;
  const { operationState } = useContext(OperationContext);
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

  return isVisible ? (
    <Layout onContextMenu={preventContextMenuPropagation}>
      <NavLayout colors={colors}>
        <Nav />
      </NavLayout>
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
          colors={colors}
          variant={"ghost_icon"}
          style={{ marginRight: "0.5rem" }}
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          <Icon name={isSidebarExpanded ? "collapse" : "expand"} />
        </Button>
        <Properties>
          <PropertiesPanel />
        </Properties>
        {version && (
          <Typography
            token={{
              fontFamily: "Equinor",
              fontSize: "0.875rem",
              color: colors.text.staticIconsTertiary
            }}
          >
            v.{version}
          </Typography>
        )}
      </PropertyBar>
    </Layout>
  ) : (
    <></>
  );
};

interface ContentViewDimensions {
  width: number;
  height: number;
}

export const ContentViewDimensionsContext =
  createContext<ContentViewDimensions>({} as ContentViewDimensions);

const Layout = styled.div`
  display: grid;
  overflow: hidden;
  grid-template-areas:
    "header header header"
    "sidebar divider content"
    "footer footer footer";
  height: 100vh;
  grid-template-rows: 40px 1fr 40px;
`;

const NavLayout = styled.div<{ colors: Colors }>`
  grid-area: header;
  height: 40px;
  border-bottom: 1px solid ${(prop) => prop.colors.interactive.disabledBorder};
`;

const SidebarLayout = styled.div<{ colors: Colors }>`
  grid-area: sidebar;
  border: solid 0.1em ${(prop) => prop.colors.ui.backgroundLight};
  display: flex;
  flex-direction: column;
  min-width: 174px;
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
  width: 100vw;
  height: 40px;
  background-color: ${(props) => props.colors.ui.backgroundLight};
  grid-area: footer;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  padding-right: 0.5rem;
`;

const Properties = styled.div`
  display: flex;
  align-items: center;
`;

export default PageLayout;
