import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import ContextMenuPresenter from "components/ContextMenus/ContextMenuPresenter";
import { DesktopAppEventHandler } from "components/DesktopAppEventHandler";
import { GlobalStylesWrapper } from "components/GlobalStyles";
import { HotKeyHandler } from "components/HotKeyHandler";
import ModalPresenter from "components/Modals/ModalPresenter";
import PageLayout from "components/PageLayout";
import RefreshHandler from "components/RefreshHandler";
import { Snackbar } from "components/Snackbar";
import { MuiThemeProvider } from "contexts/MuiThemeProvider";
import { ConnectedServerProvider } from "contexts/connectedServerContext";
import { CurveThresholdProvider } from "contexts/curveThresholdContext";
import { FilterContextProvider } from "contexts/filter";
import { LoggedInUsernamesProvider } from "contexts/loggedInUsernamesContext";
import { OperationStateProvider } from "contexts/operationStateProvider";
import { QueryContextProvider } from "contexts/queryContext";
import { SidebarProvider } from "contexts/sidebarContext";
import { authRequest, msalEnabled, msalInstance } from "msal/MsalAuthProvider";
import { SnackbarProvider } from "notistack";
import { isDesktopApp } from "tools/desktopAppHelpers";
import CompactEdsProvider from "../contexts/CompactEdsProvider";

export default function Root() {
  return (
    <MsalProvider instance={msalInstance}>
      {msalEnabled && (
        <MsalAuthenticationTemplate
          interactionType={InteractionType.Redirect}
          authenticationRequest={authRequest}
        />
      )}
      <OperationStateProvider>
        <MuiThemeProvider>
          <GlobalStylesWrapper />
          <LoggedInUsernamesProvider>
            <ConnectedServerProvider>
              <CompactEdsProvider>
                <CurveThresholdProvider>
                  <SidebarProvider>
                    <FilterContextProvider>
                      <QueryContextProvider>
                        {isDesktopApp() && <DesktopAppEventHandler />}
                        <HotKeyHandler />
                        <RefreshHandler />
                        <SnackbarProvider>
                          <Snackbar />
                        </SnackbarProvider>
                        <PageLayout />
                        <ContextMenuPresenter />
                        <ModalPresenter />
                      </QueryContextProvider>
                    </FilterContextProvider>
                  </SidebarProvider>
                </CurveThresholdProvider>
              </CompactEdsProvider>
            </ConnectedServerProvider>
          </LoggedInUsernamesProvider>
        </MuiThemeProvider>
      </OperationStateProvider>
    </MsalProvider>
  );
}
