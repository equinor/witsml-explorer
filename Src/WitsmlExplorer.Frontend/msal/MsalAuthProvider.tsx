import {
  AccountInfo,
  Configuration,
  InteractionRequiredAuthError,
  PublicClientApplication,
  RedirectRequest,
  SilentRequest
} from "@azure/msal-browser";
import { AuthenticationResult } from "@azure/msal-common";

export const authRequest: RedirectRequest = {
  scopes: ["openid profile"]
};

export const msalEnabled = import.meta.env.VITE_MSALENABLED;

export const adminRole = "admin";
export const developerRole = "developer";

const msalConfig: Configuration = {
  auth: {
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_AD_TENANT_ID
    }`,
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
    redirectUri: `${import.meta.env.VITE_AZURE_AD_URL_WITSMLEXPLORER}`
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const msalInstance: PublicClientApplication =
  new PublicClientApplication(msalConfig);

export async function getAccessToken(scopes: string[]): Promise<string | null> {
  let accounts = msalInstance.getAllAccounts();
  if (accounts.length < 1) {
    await new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          resolve();
          clearInterval(intervalId);
        }
      }, 100);
    });
  }

  const request: SilentRequest & RedirectRequest = {
    scopes: scopes,
    account: accounts[0]
  };

  let accessToken = null;
  await msalInstance
    .acquireTokenSilent(request)
    .then((response: AuthenticationResult) => {
      accessToken = response.accessToken;
    })
    .catch((error) => {
      // acquireTokenSilent can fail for a number of reasons, fallback to interaction
      if (error instanceof InteractionRequiredAuthError) {
        msalInstance.acquireTokenRedirect(request);
      }
    });
  return accessToken;
}

export const getAccountInfo = (): AccountInfo | null => {
  let activeAccount = null;
  const allAccounts = msalInstance.getAllAccounts();

  if (allAccounts.length < 1) {
    return null;
  } else if (allAccounts.length > 1) {
    activeAccount = msalInstance.getActiveAccount();
  } else if (allAccounts.length === 1) {
    activeAccount = allAccounts[0];
  }
  return activeAccount;
};

export const getUserAppRoles = (): string[] =>
  getAccountInfo()?.idTokenClaims?.roles ?? [];

export const getUsername = (): string | null => getAccountInfo()?.username;

export async function signOut(): Promise<void> {
  type TokenClaims = {
    login_hint: string;
  };
  const activeAccount = getAccountInfo();
  if (!activeAccount) return;

  const logoutRequest = {
    account: activeAccount,
    logoutHint: activeAccount
      ? (activeAccount.idTokenClaims as TokenClaims).login_hint
      : undefined
  };

  msalInstance.logoutRedirect(logoutRequest);
}
