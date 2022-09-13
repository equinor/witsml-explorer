import { AccountInfo, Configuration, InteractionRequiredAuthError, PublicClientApplication, RedirectRequest, SilentRequest } from "@azure/msal-browser";
import { AuthenticationResult } from "@azure/msal-common";

export const authRequest: RedirectRequest = {
  scopes: ["openid profile"]
};

export const msalEnabled = process.env.NEXT_PUBLIC_MSALENABLED;
export const msalSecurityScheme = "OAuth2";

const msalConfig: Configuration = {
  auth: {
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_AZURE_AD_URL_WITSMLEXPLORER}`
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const msalInstance: PublicClientApplication = new PublicClientApplication(msalConfig);

export async function getAccessToken(scopes: string[]): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  let accessToken = null;

  if (accounts.length > 0) {
    const request: SilentRequest & RedirectRequest = {
      scopes: scopes,
      account: accounts[0]
    };

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
  }
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

export async function signOut(): Promise<void> {
  type TokenClaims = {
    login_hint: string;
  };
  const activeAccount = getAccountInfo();
  if (!activeAccount) return;

  const logoutRequest = {
    account: activeAccount,
    logoutHint: activeAccount ? (activeAccount.idTokenClaims as TokenClaims).login_hint : undefined
  };

  msalInstance.logoutRedirect(logoutRequest);
}
