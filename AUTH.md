# Authentication and Authorization in WITSML Explorer

## WITSML server credentials flow
Every request run against a WITSML server is run from the backend and needs to be authenticated.
Basic auth is required for a lot of servers, so that is currently the main way WE authenticate against them.

Most actions done by the user in WE involves fetching or writing data to external WITSML servers. All these requests require credentials to be provided. 
It would be a very bad user experience if the user would have to provide credentials for every request. 
Therefore an encrypted version of the passwords is saved in memory on the frontend.

The webapp only stores them for a limited amount of time, and will provide them for every request involving WITSML servers. 

The backend has a [Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction) storage running in memory, which is used for creating the encrypted passwords as well as decrypting them (only possible for that running instance).
Whenever a request is run towards a WITSML server, the backend will decrypt the password, and use it when running the request against the given WITSML server.

This is how the flow is when a user has selected a server and will need to authenticate against it. After this is done, a fresh list of wells is fetched.  

<img src="./credentials-flow.svg">

## OAuth2
OAuth2 authorization code flow and system credentials fetched from keyvault can also be used for a simplified end user experience. Examples are outlined below for Azure AD and Azure keyvault.

## Swagger
When developing, visit `https://localhost:5001/swagger/index.html` to examine endpoints and authentication schemes. Setup will be outlined below.

## Basic authentication
The `WitsmlServerHandler` at `/api/witsml-servers` endpoint can be used to get a list of witsml servers in json format without any credentials.

`Basic` authentication is available by default and `username`/`password` should first be used to get an encrypted password from the `AuthorizationHandler` `/api/authorize` endpoint along with information about the server as json in the body.

After aquiring this token, you should use the authorize button again (Basic), but this time with your `username`/`encrypted password`. The encrypted password received from the authorizationhandler.

Entering this in swagger the Authorization/BasicAuth fields will make sure to include the `Authorization: Basic ...` header in your successive calls to other endpoints. The header value `Witsml-ServerUrl` for the same server you got the token also needs to be filled out as the credentials are valid only for a specific server.

## OAuth2 authentication
`OAuth2` authentication is turned off by default both in backend and frontend through the appsettings property `OAuth2Enabled`. For information about OAuth2 authorization code flow see: [auth code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

If you want to add this flow to SwaggerUI, you need to customize the following info matching your own Azure app registration in the `mysettings.json` file. For information about app registrations and app roles setup see []()

**example `mysettings.json` file:**

```json
    "OAuth2Enabled": true,
    "AzureAd": {
        "AppName": "witsml-explorer-api",
        "Instance": "https://login.microsoftonline.com/",
        "TenantId": "b3edbf8f-e8b2-4c4e-96fc-c86cdd7fd55f",
        "ClientId": "109e12e2-4ca7-48d0-af05-c834c88ff22c",
        "PolicyRoles": [  "admin", "developer", "employee" ],
        "TokenValidationParameters": {
            "ValidateAudience": false,
            "ValidateIssuerSigningKey": true,
            "ValidateTokenReplay": true
        },
        "Swagger": {
            "AppName": "witsml-explorer-swaggerui",
            "AuthorizationUrl": "https://login.microsoftonline.com/b3edbf8f-e8b2-4c4e-96fc-c86cdd7ed55f/oauth2/v2.0/authorize",
            "TokenUrl": "https://login.microsoftonline.com/b3edbf8f-e8b2-4c4e-96fc-c86cdd7ed55f/oauth2/v2.0/token",
            "ClientId": "5abc9bc0-3ecb-423b-8457-da3c017c547a",
            "Scopes": "api://a10111dc-712d-485f-8600-57be8c597921/access_as_user",
        },
        "KVWitsmlServerCreds": "witsmlexp-servers-kv",
    }
``` 

By enabling the `"OAuth2Enabled": true,` setting, you should now find a new entry: `AuthorizationCode with PKCE` available in the Swagger UI.

All endpoints will now need a logged in user, authenticated by your tenant.

### System credentials

System credentials for a server can be included through a `secrets.json` file or in Azure keyvault:

**secrets.json format**
```json
"WitsmlCreds": {
    "prod":  { "Host": "https://url1", "UserId": "user1", "Password": "pw1" },
    "test":  { "Host": "https://url2", "UserId": "user2", "Password": "pw2" }
}    
```

To use Azure keyvault, create your keyvault (above named `witsmlexp-servers-kv`) and enter your system credentials as secrets in the following format to be included and automatically cached at api startup.

**example keyvault entries**


| Name         | Type      | Status   | Expiration date |
|--------------|-----------|------------|------------|
| witsmlcreds--prod--host | My server1 prod [R]      |         ||
| witsmlcreds--prod--password | My server1 prod [R]      |         ||
| witsmlcreds--prod--userid | My server1 prod [R]      |         ||
| witsmlcreds--test--host | My server2 test [CRUD]      |         ||
| witsmlcreds--test--password | My server2 test [CRUD]      |         ||
| witsmlcreds--test--userid | My server2 test [CRUD]      |         ||

 
### Serverlist

Credentials will be mapped on URL from secrets with the serverlist. `Server` entry in MongoDB or CosmosDB will have property `securityscheme` that can be `Basic` or `OAuth2`

The app role assigned to a server will be compared to the rolw claims in the JWT provided in the Authorization header. If a user has been assigned the application role, system credentials will be applied to the connection.

For more info on app roles, see: [app roles](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps)

**example server json in list**
```json
{
    "name": "Equinor WITSML",
    "url": "https://witsml007.someserver/store/WITSML",
    "description": "Equinor testserver. Do not edit any datasets",
    "securityScheme": "OAuth2",
    "role": "user"
}
```

**example JWT from Bearer token**
```json
  "roles": [
    "developer",
    "admin",
    "user"
  ]
```

### MSAL Frontend
To enable Oauth2 with MSAL in frontend, the following environment settings can be set:
```bash
# To disable MSAL, leave NEXT_PUBLIC_MSALENABLED empty
NEXT_PUBLIC_MSALENABLED=
NEXT_PUBLIC_AZURE_AD_TENANT_ID=
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=
NEXT_PUBLIC_AZURE_AD_URL_WITSMLEXPLORER=http://localhost:3000/
NEXT_PUBLIC_AZURE_AD_SCOPE_API=

```
