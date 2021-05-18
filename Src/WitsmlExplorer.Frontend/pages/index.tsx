import React from "react";
import Head from "next/head";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar/Sidebar";
import ContentView from "../components/ContentView";
import styled from "styled-components";
import GlobalStyles from "../components/GlobalStyles";
import { getTheme } from "../styles/material-eds";
import { ThemeProvider } from "@material-ui/core";
import ModalPresenter from "../components/Modals/ModalPresenter";
import ContextMenuPresenter from "../components/ContextMenus/ContextMenuPresenter";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import NavigationContext from "../contexts/navigationContext";
import OperationContext from "../contexts/operationContext";
import { initNavigationStateReducer } from "../contexts/navigationStateReducer";
import { initOperationStateReducer } from "../contexts/operationStateReducer";
import { SnackbarProvider } from "notistack";
import Snackbar from "../components/Snackbar";
import Alerts from "../components/Alerts";
import { preventContextMenuPropagation } from "../components/ContextMenus/ContextMenu";
import RefreshHandler from "../components/RefreshHandler";
import { colors } from "../styles/Colors";
import Routing from "../components/Routing";
import { AssetsLoader } from "../components/AssetsLoader";

const Home = (): React.ReactElement => {
  const [operationState, dispatchOperation] = initOperationStateReducer();
  const [navigationState, dispatchNavigation] = initNavigationStateReducer();

  return (
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
              <SidebarLayout>
                <Sidebar />
              </SidebarLayout>
              <ContentViewLayout>
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
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content";
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
  width: 15vw;
`;

const ContentViewLayout = styled.div`
  grid-area: content;
  overflow-y: auto;
  overflow-x: hidden;
  height: 93vh;
  width: 85vw;
`;

export default Home;
