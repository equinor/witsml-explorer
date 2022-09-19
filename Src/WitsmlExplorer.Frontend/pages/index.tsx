import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import MomentUtils from "@date-io/moment";
import { ThemeProvider } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import Alerts from "../components/Alerts";
import { AssetsLoader } from "../components/AssetsLoader";
import ContentView from "../components/ContentView";
import { preventContextMenuPropagation } from "../components/ContextMenus/ContextMenu";
import ContextMenuPresenter from "../components/ContextMenus/ContextMenuPresenter";
import GlobalStyles from "../components/GlobalStyles";
import ModalPresenter from "../components/Modals/ModalPresenter";
import Nav from "../components/Nav";
import RefreshHandler from "../components/RefreshHandler";
import Routing from "../components/Routing";
import Sidebar from "../components/Sidebar/Sidebar";
import Snackbar from "../components/Snackbar";
import NavigationContext from "../contexts/navigationContext";
import { initNavigationStateReducer } from "../contexts/navigationStateReducer";
import OperationContext from "../contexts/operationContext";
import { initOperationStateReducer } from "../contexts/operationStateReducer";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import { authRequest, msalEnabled, msalInstance } from "../msal/MsalAuthProvider";
import { colors } from "../styles/Colors";
import { getTheme } from "../styles/material-eds";

const Home = (): React.ReactElement => {
  const [operationState, dispatchOperation] = initOperationStateReducer();
  const [navigationState, dispatchNavigation] = initNavigationStateReducer();

  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(268);
  const { width: documentWidth } = useDocumentDimensions();

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: { stopPropagation: () => void; preventDefault: () => void; clientX: number }) => {
      if (isResizing) {
        mouseMoveEvent.stopPropagation();
        mouseMoveEvent.preventDefault();
        setSidebarWidth(mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left);
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const approximateDividerWidth = 13;
  const contentWidth = documentWidth - sidebarWidth - approximateDividerWidth;
  return (
    <MsalProvider instance={msalInstance}>
      {msalEnabled && <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest} />}
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <OperationContext.Provider value={{ operationState, dispatchOperation }}>
          <ThemeProvider theme={getTheme(operationState.theme)}>
            <GlobalStyles />
            <Head>
              <title>WITSML Explorer</title>
              <link rel="icon" href={AssetsLoader.getAssetsRoot() + "/favicon.ico"} />
            </Head>
            <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
              <Routing />
              <RefreshHandler />
              <SnackbarProvider>
                <Snackbar />
              </SnackbarProvider>
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
            </NavigationContext.Provider>
            <ContextMenuPresenter />
            <ModalPresenter />
          </ThemeProvider>
        </OperationContext.Provider>
      </MuiPickersUtilsProvider>
    </MsalProvider>
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

export default Home;
