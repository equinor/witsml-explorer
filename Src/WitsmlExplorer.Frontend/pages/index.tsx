import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import MomentUtils from "@date-io/moment";
import { ThemeProvider } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import React from "react";
import { AssetsLoader } from "../components/AssetsLoader";
import ContextMenuPresenter from "../components/ContextMenus/ContextMenuPresenter";
import GlobalStyles from "../components/GlobalStyles";
import ModalPresenter from "../components/Modals/ModalPresenter";
import PageLayout from "../components/PageLayout";
import RefreshHandler from "../components/RefreshHandler";
import Routing from "../components/Routing";
import Snackbar from "../components/Snackbar";
import NavigationContext from "../contexts/navigationContext";
import { initNavigationStateReducer } from "../contexts/navigationStateReducer";
import OperationContext from "../contexts/operationContext";
import { initOperationStateReducer } from "../contexts/operationStateReducer";
import { authRequest, msalEnabled, msalInstance } from "../msal/MsalAuthProvider";
import { getTheme } from "../styles/material-eds";

const Home = (): React.ReactElement => {
  const [operationState, dispatchOperation] = initOperationStateReducer();
  const [navigationState, dispatchNavigation] = initNavigationStateReducer();

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker Registered");
      });
    }
  }, []);

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
              <link rel="manifest" href={AssetsLoader.getAssetsRoot() + "/manifest.webmanifest"} />
            </Head>
            <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
              <Routing />
              <RefreshHandler />
              <SnackbarProvider>
                <Snackbar />
              </SnackbarProvider>
              <PageLayout />
            </NavigationContext.Provider>
            <ContextMenuPresenter />
            <ModalPresenter />
          </ThemeProvider>
        </OperationContext.Provider>
      </MuiPickersUtilsProvider>
    </MsalProvider>
  );
};

export default Home;
